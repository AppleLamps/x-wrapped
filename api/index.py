import os
import sys
import json
import re
from datetime import datetime
from http.server import BaseHTTPRequestHandler
from typing import List, Optional
from enum import Enum

from pydantic import BaseModel, Field

# Fix Windows console encoding for emoji support
if sys.platform == 'win32':
    sys.stdout.reconfigure(encoding='utf-8', errors='replace')
    sys.stderr.reconfigure(encoding='utf-8', errors='replace')


# =============================================================================
# PYDANTIC SCHEMAS FOR STRUCTURED OUTPUT (Content-Focused, No Fake Metrics)
# =============================================================================

class PersonalityArchetype(BaseModel):
    """The user's X personality type based on their content"""
    archetype: str = Field(description="The personality archetype name (e.g., 'The Thread Weaver', 'The Hot Take Artist', 'The Meme Curator', 'The Knowledge Dropper', 'The Community Builder', 'The Vibe Curator', 'The Industry Insider', 'The Storyteller')")
    description: str = Field(description="2-3 sentence description of this personality type and why it fits the user")
    traits: List[str] = Field(description="3-5 key traits that define this personality", default_factory=list)
    spirit_emoji: str = Field(description="A single emoji that represents their X spirit", default="✨")


class VibeAnalysis(BaseModel):
    """Sentiment analysis as relative proportions, not absolute counts"""
    positive_percentage: int = Field(description="Relative percentage of positive vibes (0-100)", ge=0, le=100, default=33)
    neutral_percentage: int = Field(description="Relative percentage of neutral vibes (0-100)", ge=0, le=100, default=34)
    negative_percentage: int = Field(description="Relative percentage of negative/critical vibes (0-100)", ge=0, le=100, default=33)
    overall_vibe: str = Field(description="One word or short phrase describing their overall energy (e.g., 'Optimistic Realist', 'Chaotic Good', 'Thoughtful Critic')", default="Balanced")
    vibe_description: str = Field(description="2-3 sentence description of how their mood and tone comes across in their posts", default="")


class ThemeData(BaseModel):
    """Topics as themes with relative weight, not counts"""
    theme: str = Field(description="Name of the topic or theme (short, 1-3 words)")
    weight: int = Field(description="Relative prominence 1-100 (how much this theme appears relative to others)", ge=1, le=100, default=50)
    sample_context: str = Field(description="Brief example of how they discuss this topic", default="")


class VoiceAnalysis(BaseModel):
    """Deep analysis of their unique writing voice"""
    style_summary: str = Field(description="2-3 sentence overview of their writing style")
    vocabulary_level: str = Field(description="Description of vocabulary (e.g., 'Casual and conversational', 'Technical and precise', 'Playful with internet slang')")
    tone: str = Field(description="Primary tone (e.g., 'Sarcastic', 'Earnest', 'Analytical', 'Playful', 'Passionate')")
    signature_phrases: List[str] = Field(description="2-4 words, phrases, or expressions they use often", default_factory=list)
    emoji_style: str = Field(description="How they use emojis (e.g., 'Heavy emoji user 🔥', 'Minimal and strategic', 'No emojis, all words')", default="Moderate emoji user")
    post_length_style: str = Field(description="Whether they prefer short punchy posts, long threads, or mixed", default="Mixed")


class ContentMixCategory(BaseModel):
    """A category in their content mix"""
    category: str = Field(description="Type of content (e.g., 'Hot Takes', 'Threads', 'Memes & Humor', 'Questions', 'Personal Updates', 'Industry Insights', 'Quote Tweets')")
    percentage: int = Field(description="Relative percentage of their content (0-100)", ge=0, le=100, default=0)


class ContentMix(BaseModel):
    """What types of content they create (qualitative, not counts)"""
    categories: List[ContentMixCategory] = Field(description="Breakdown of content types they post", default_factory=list)
    primary_mode: str = Field(description="Their main content creation style (e.g., 'Original thinker', 'Curator and commenter', 'Conversation starter', 'Thread builder')", default="Original thinker")
    engagement_style: str = Field(description="How they interact with others (e.g., 'Reply king', 'Quote tweet analyst', 'Lurker who occasionally drops gems')", default="")


class HighlightMoment(BaseModel):
    """A notable moment from their year, focused on content not metrics"""
    title: str = Field(description="Short catchy title for this moment (e.g., 'The Thread That Went Deep', 'Hot Take Season')")
    description: str = Field(description="2-3 sentence description of what made this moment notable")
    post_snippet: str = Field(description="A representative quote or snippet from this period", default="")
    time_period: str = Field(description="When this happened (e.g., 'Early Spring', 'Summer', 'October')", default="")


class GreatestHit(BaseModel):
    """A memorable post, selected for quality not engagement numbers"""
    content: str = Field(description="The post text (can be truncated if very long)")
    category: str = Field(description="Why it's a hit (e.g., 'Most Thought-Provoking', 'Funniest Moment', 'Hottest Take', 'Best Thread', 'Most Relatable')")
    context: str = Field(description="Brief context about why this post stands out", default="")


class WrappedResponse(BaseModel):
    """Complete wrapped data for a user's year on X - Content-focused, no fake metrics"""
    personality: PersonalityArchetype = Field(description="The user's X personality archetype")
    vibe: VibeAnalysis = Field(description="Overall vibe and sentiment analysis")
    themes: List[ThemeData] = Field(description="Top themes/topics they discuss (5-7 themes)", default_factory=list)
    voice: VoiceAnalysis = Field(description="Deep analysis of their writing voice and style")
    content_mix: ContentMix = Field(description="What types of content they create")
    highlights: List[HighlightMoment] = Field(description="3-5 notable moments from the year", default_factory=list)
    greatest_hits: List[GreatestHit] = Field(description="3-5 memorable posts selected for quality", default_factory=list)
    year_story: str = Field(description="3-5 sentence narrative telling the story of their year on X", default="Unable to generate story.")


# Fun, engaging messages for each tool call
TOOL_MESSAGES = {
    "x_keyword_search": [
        "🔍 Diving into your posts...",
        "📜 Scrolling through your timeline...",
        "🕵️ Finding your hidden gems...",
        "✨ Uncovering your best moments...",
    ],
    "x_semantic_search": [
        "🧠 Understanding your vibes...",
        "💭 Reading between the lines...",
        "🎯 Finding posts that hit different...",
    ],
    "x_user_search": [
        "👤 Looking up your profile...",
        "🔎 Finding your account...",
    ],
    "x_thread_fetch": [
        "🧵 Pulling up your threads...",
        "📖 Reading your stories...",
    ],
    "code_execution": [
        "🧮 Crunching the numbers...",
        "📊 Calculating your stats...",
        "💯 Running the math...",
        "📈 Analyzing your data...",
    ],
    "view_x_video": [
        "🎬 Watching your videos...",
        "📹 Reviewing your clips...",
    ],
    "view_image": [
        "🖼️ Checking out your pics...",
        "📸 Admiring your photos...",
    ],
    "web_search": [
        "🌐 Searching the web...",
        "🔗 Finding more context...",
    ],
    "browse_page": [
        "📄 Reading more details...",
        "🔍 Digging deeper...",
    ],
}

# Track tool call counts to rotate messages
tool_call_counts: dict[str, int] = {}


def get_tool_message(tool_name: str) -> str:
    """Get a fun message for a tool call, rotating through available messages."""
    messages = TOOL_MESSAGES.get(tool_name, [f"🔄 {tool_name.replace('_', ' ').title()}..."])
    count = tool_call_counts.get(tool_name, 0)
    tool_call_counts[tool_name] = count + 1
    return messages[count % len(messages)]


def generate_wrapped_streaming(username: str):
    """Generate a detailed wrapped report for a user using agentic tool calling + structured output"""
    from xai_sdk import Client
    from xai_sdk.chat import user, assistant
    from xai_sdk.tools import x_search, code_execution
    
    try:
        api_key = os.getenv("XAI_API_KEY")
        if not api_key:
            yield f"data: {json.dumps({'type': 'error', 'error': 'XAI_API_KEY environment variable is not set'})}\n\n"
            return
        
        client = Client(api_key=api_key)
        current_year = datetime.now().year
        
        # Progress update
        yield f"data: {json.dumps({'type': 'progress', 'message': f'🚀 Firing up Grok for @{username}...', 'step': 1, 'total': 3})}\n\n"
        
        # =================================================================
        # STEP 1: AGENTIC TOOL CALLING - Gather all data about the user
        # (Agentic requests do NOT support structured output)
        # =================================================================
        agentic_chat = client.chat.create(
            model="grok-4-1-fast",
            tools=[x_search(enable_image_understanding=True), code_execution()],
        )
        
        analysis_prompt = f"""Analyze @{username}'s X (Twitter) content and personality for {current_year}.

IMPORTANT: Focus on CONTENT ANALYSIS, not metrics. We cannot accurately count total posts, likes, or engagement - but we CAN deeply analyze the content of posts we find.

Your task:
1. Search for posts from @{username} throughout {current_year}
2. For each post found, note: the full content, the date/time period, what it reveals about the person
3. Analyze their PERSONALITY and VOICE - what kind of X user are they?
4. Identify their top THEMES and TOPICS - what do they care about?
5. Analyze their WRITING STYLE - how do they express themselves?
6. Note their CONTENT MIX - do they post threads, hot takes, memes, questions?
7. Find their GREATEST HITS - posts that are memorable for their content quality
8. Identify NOTABLE MOMENTS - interesting periods or topics from their year

Personality archetypes to consider:
- "The Thread Weaver" - Loves building detailed, thoughtful threads
- "The Hot Take Artist" - Posts bold, provocative opinions
- "The Meme Curator" - Shares humor and cultural moments
- "The Knowledge Dropper" - Educational, informative content
- "The Community Builder" - Highly interactive, lots of replies
- "The Vibe Curator" - Aesthetic posts, mood-setting content
- "The Industry Insider" - Focused professional/niche expertise
- "The Storyteller" - Personal narratives and life updates

Use x_search to gather posts. Provide a detailed QUALITATIVE analysis with actual post content, personality observations, voice analysis, and thematic insights. DO NOT focus on counting or metrics."""
        
        agentic_chat.append(user(analysis_prompt))
        
        # Reset tool call counts for this request
        tool_call_counts.clear()
        
        # Stream the agent's reasoning and tool calls
        analysis_content = []
        for response, chunk in agentic_chat.stream():
            # Stream tool calls as progress updates
            if chunk.tool_calls:
                for tool_call in chunk.tool_calls:
                    message = get_tool_message(tool_call.function.name)
                    yield f"data: {json.dumps({'type': 'progress', 'message': message, 'step': 1, 'total': 3})}\n\n"
            if chunk.content:
                content = chunk.content
                analysis_content.append(content)
                yield f"data: {json.dumps({'type': 'analysis_chunk', 'content': content})}\n\n"
        
        # Combine all streamed content - this is the raw analysis
        raw_analysis = "".join(analysis_content)
        
        if not raw_analysis.strip():
            yield f"data: {json.dumps({'type': 'error', 'error': 'No analysis data was generated. Please try again.'})}\n\n"
            return
        
        # =================================================================
        # STEP 2: STRUCTURED OUTPUT - Format the raw analysis into JSON
        # (Use a separate non-agentic chat with .parse() for guaranteed JSON)
        # =================================================================
        yield f"data: {json.dumps({'type': 'progress', 'message': '✨ Generating your wrapped...', 'step': 2, 'total': 3})}\n\n"
        
        # Create a new chat for structured output (no tools = non-agentic)
        format_chat = client.chat.create(model="grok-3-fast")
        
        format_prompt = f"""Based on the following content analysis of @{username}'s X activity for {current_year}, structure the insights into the required JSON format.

=== RAW ANALYSIS ===
{raw_analysis}
=== END ANALYSIS ===

Instructions:
- Assign a PERSONALITY ARCHETYPE that best fits (Thread Weaver, Hot Take Artist, Meme Curator, Knowledge Dropper, Community Builder, Vibe Curator, Industry Insider, or Storyteller)
- Include a spirit_emoji that captures their energy
- Analyze their VIBE with sentiment percentages (relative proportions, not counts)
- List 5-7 THEMES they discuss with relative weights (1-100, bigger = more prominent)
- Provide deep VOICE analysis: vocabulary level, tone, signature phrases, emoji style
- Break down their CONTENT MIX: what types of posts do they favor?
- Include 3-5 HIGHLIGHT MOMENTS with catchy titles and descriptions
- Select 3-5 GREATEST HITS - memorable posts categorized by why they stand out
- Write a compelling year_story narrative (3-5 sentences telling their X story)

IMPORTANT: Focus on qualitative insights, not metrics. We're analyzing their content and personality, not counting their engagement."""

        format_chat.append(user(format_prompt))
        
        # Use .parse() to get guaranteed structured JSON output
        try:
            response, wrapped = format_chat.parse(WrappedResponse)
            wrapped_data = wrapped.model_dump()
        except Exception as parse_error:
            print(f"⚠️ Structured output parsing failed: {parse_error}")
            # Fallback: Create a response with the raw analysis
            wrapped_data = {
                "personality": {
                    "archetype": "The Storyteller",
                    "description": "Based on the content found, this user shares their perspective on X in their own unique way.",
                    "traits": ["Expressive", "Engaged", "Authentic"],
                    "spirit_emoji": "✨"
                },
                "vibe": {
                    "positive_percentage": 40,
                    "neutral_percentage": 40,
                    "negative_percentage": 20,
                    "overall_vibe": "Balanced",
                    "vibe_description": "A mix of perspectives and moods throughout the year."
                },
                "themes": [],
                "voice": {
                    "style_summary": "Unable to fully characterize writing style from available content.",
                    "vocabulary_level": "Conversational",
                    "tone": "Authentic",
                    "signature_phrases": [],
                    "emoji_style": "Moderate",
                    "post_length_style": "Mixed"
                },
                "content_mix": {
                    "categories": [],
                    "primary_mode": "Original thinker",
                    "engagement_style": "Active participant"
                },
                "highlights": [],
                "greatest_hits": [],
                "year_story": raw_analysis[:2000] if raw_analysis else f"Analysis for @{username} could not be fully structured."
            }
        
        # Progress: complete
        yield f"data: {json.dumps({'type': 'progress', 'message': '🎉 Done!', 'step': 3, 'total': 3})}\n\n"
        yield f"data: {json.dumps({'type': 'complete', 'data': wrapped_data})}\n\n"
    
    except GeneratorExit:
        # Client disconnected, clean up gracefully
        print(f"⚠️ Client disconnected during stream for @{username}")
        return
    except Exception as e:
        # Send error to client and log it
        print(f"❌ Error generating wrapped for @{username}: {e}")
        import traceback
        traceback.print_exc()
        yield f"data: {json.dumps({'type': 'error', 'error': str(e)})}\n\n"


class handler(BaseHTTPRequestHandler):
    """Vercel Python serverless function handler."""
    
    def do_POST(self):
        """Handle POST requests for streaming wrapped generation."""
        try:
            # Read request body
            content_length = int(self.headers.get('Content-Length', 0))
            body = self.rfile.read(content_length)
            data = json.loads(body) if body else {}
            
            username = data.get("username", "").replace("@", "")
            
            if not username:
                self.send_response(400)
                self.send_header('Content-Type', 'application/json')
                self.send_header('Access-Control-Allow-Origin', '*')
                self.end_headers()
                self.wfile.write(json.dumps({"error": "Username is required"}).encode())
                return
            
            # Set up SSE response headers
            self.send_response(200)
            self.send_header('Content-Type', 'text/event-stream')
            self.send_header('Cache-Control', 'no-cache')
            self.send_header('Connection', 'keep-alive')
            self.send_header('X-Accel-Buffering', 'no')
            self.send_header('Access-Control-Allow-Origin', '*')
            self.end_headers()
            
            # Stream the response
            for chunk in generate_wrapped_streaming(username):
                self.wfile.write(chunk.encode())
                self.wfile.flush()
                
        except Exception as e:
            self.send_response(500)
            self.send_header('Content-Type', 'application/json')
            self.send_header('Access-Control-Allow-Origin', '*')
            self.end_headers()
            self.wfile.write(json.dumps({"error": str(e)}).encode())
    
    def do_OPTIONS(self):
        """Handle CORS preflight requests."""
        self.send_response(200)
        self.send_header('Access-Control-Allow-Origin', '*')
        self.send_header('Access-Control-Allow-Methods', 'POST, OPTIONS')
        self.send_header('Access-Control-Allow-Headers', 'Content-Type')
        self.end_headers()
    
    def do_GET(self):
        """Handle GET requests with a simple health check."""
        self.send_response(200)
        self.send_header('Content-Type', 'application/json')
        self.send_header('Access-Control-Allow-Origin', '*')
        self.end_headers()
        self.wfile.write(json.dumps({"status": "ok", "message": "X Wrapped API - Use POST to generate wrapped"}).encode())


# =============================================================================
# LOCAL DEVELOPMENT SERVER (Flask)
# =============================================================================
if __name__ == "__main__":
    import signal
    import atexit
    from flask import Flask, Response, request, jsonify
    from flask_cors import CORS
    
    flask_app = Flask(__name__)
    CORS(flask_app)
    
    # Track if we're shutting down
    shutting_down = False
    
    def graceful_shutdown(signum=None, frame=None):
        """Handle graceful shutdown on signals."""
        global shutting_down
        if shutting_down:
            return
        shutting_down = True
        print("\n🛑 Shutting down Flask server...")
        sys.exit(0)
    
    def cleanup():
        """Cleanup function called on exit."""
        print("🧹 Cleanup complete.")
    
    # Register signal handlers for graceful shutdown
    signal.signal(signal.SIGINT, graceful_shutdown)   # Ctrl+C
    signal.signal(signal.SIGTERM, graceful_shutdown)  # kill command
    
    # Register cleanup function
    atexit.register(cleanup)

    @flask_app.route("/api/wrapped/stream", methods=["POST"])
    def stream_handler():
        """Handle POST requests for streaming wrapped generation."""
        try:
            data = request.get_json()
            username = data.get("username", "").replace("@", "") if data else ""
            
            if not username:
                return jsonify({"error": "Username is required"}), 400
            
            return Response(
                generate_wrapped_streaming(username),
                mimetype="text/event-stream",
                headers={
                    "Cache-Control": "no-cache",
                    "Connection": "keep-alive",
                    "X-Accel-Buffering": "no",
                }
            )
        except Exception as e:
            return jsonify({"error": str(e)}), 500
    
    @flask_app.route("/api/wrapped/stream", methods=["OPTIONS"])
    def options_handler():
        """Handle CORS preflight requests."""
        return "", 200
    
    @flask_app.route("/api", methods=["GET"])
    @flask_app.route("/api/wrapped/stream", methods=["GET"])
    def health_check():
        """Health check endpoint."""
        return jsonify({"status": "ok", "message": "X Wrapped API - Use POST to generate wrapped"})

    try:
        print("🚀 Starting Flask server on http://localhost:5328")
        print("   Press Ctrl+C to stop\n")
        flask_app.run(
            debug=False,  # Disable debug to prevent double-loading
            port=5328,
            use_reloader=False,  # Disable reloader for cleaner shutdown
            threaded=True,
        )
    except KeyboardInterrupt:
        graceful_shutdown()
    except Exception as e:
        print(f"❌ Server error: {e}")
        sys.exit(1)


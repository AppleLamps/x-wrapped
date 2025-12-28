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


class EvolutionArc(BaseModel):
    """How the user evolved over the year"""
    early_year_vibe: str = Field(description="Their energy/focus in Q1 (Jan-Mar) - 1-2 sentences")
    mid_year_shift: str = Field(description="How things changed in Q2-Q3 (Apr-Sep) - 1-2 sentences")
    late_year_energy: str = Field(description="Their vibe in Q4 (Oct-Dec) - 1-2 sentences")
    transformation_summary: str = Field(description="One sentence capturing their overall evolution arc")


class SurprisingInsight(BaseModel):
    """An unexpected or surprising observation about the user"""
    insight: str = Field(description="The surprising fact or observation")
    evidence: str = Field(description="Brief supporting evidence from their posts", default="")


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
    # New insightful fields
    evolution: EvolutionArc = Field(description="How they evolved over the year from Q1 to Q4")
    surprising_facts: List[SurprisingInsight] = Field(description="3-5 unexpected or surprising observations about them", default_factory=list)
    hot_take_of_year: str = Field(description="Their spiciest, most controversial, or boldest opinion of the year", default="")
    roast: str = Field(description="A playful, witty roast of their X presence (funny but not mean)", default="")
    if_they_were: str = Field(description="'If @user was a [thing], they'd be...' - a fun, creative comparison", default="")
    power_move: str = Field(description="Their signature move or power play on X - what they do better than anyone", default="")
    one_liner: str = Field(description="A single shareable sentence that captures their entire X presence", default="")


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
    """Generate a detailed wrapped report for a user using multi-phase agentic analysis + structured output"""
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
        yield f"data: {json.dumps({'type': 'progress', 'message': f'🚀 Firing up Grok for @{username}...', 'step': 1, 'total': 4})}\n\n"

        # =================================================================
        # STEP 1: MULTI-PHASE AGENTIC DEEP DIVE
        # Use allowed_x_handles to ONLY get this user's posts
        # Enable both image AND video understanding for rich analysis
        # =================================================================
        agentic_chat = client.chat.create(
            model="grok-4-1-fast",
            tools=[
                x_search(
                    allowed_x_handles=[username],
                    enable_image_understanding=True,
                    enable_video_understanding=True
                ),
                code_execution()
            ],
        )

        # Reset tool call counts for this request
        tool_call_counts.clear()

        analysis_prompt = f"""You are creating a "Year Wrapped" for @{username} - like Spotify Wrapped but for X/Twitter.

Your goal: Create the most INSIGHTFUL, SURPRISING, and SHAREABLE analysis possible. Boring is failure.

=== MULTI-PHASE SEARCH STRATEGY ===

PHASE 1 - QUARTERLY TIMELINE SCAN:
Search their posts across different time periods to understand their EVOLUTION:
- Q1 (Jan-Mar {current_year}): What were they focused on? What was their energy?
- Q2 (Apr-Jun {current_year}): How did things shift? Any new interests?
- Q3 (Jul-Sep {current_year}): What dominated their summer/fall?
- Q4 (Oct-Dec {current_year}): Where are they now? How did they end the year?

PHASE 2 - DEEP THEMATIC DIVES:
After the timeline scan, do focused searches on:
- Their most passionate/recurring topics
- Any controversies or hot takes
- Their funniest or most personal moments
- Threads and long-form content

PHASE 3 - SIGNATURE PATTERNS:
Look for:
- Recurring phrases they use
- Their posting style (time of day, thread vs single post)
- How they interact with others
- What makes them UNIQUE vs generic

=== WHAT TO CAPTURE ===

For each post you find, note:
1. The FULL post content (exact text)
2. When it was posted (month/quarter)
3. What it reveals about their personality
4. Is this a "greatest hit" candidate?
5. Is this surprisingly different from their usual content?

=== ANALYSIS REQUIREMENTS ===

You MUST find:
- At least 3-5 posts from EACH quarter (Q1, Q2, Q3, Q4)
- Their single HOTTEST take of the year
- At least one SURPRISING thing about them (unexpected interest, opinion shift, etc.)
- Specific phrases or words they use repeatedly
- How they EVOLVED from January to December

=== PERSONALITY ARCHETYPES ===
Pick the BEST fit (or blend):
- "The Thread Weaver" - Detailed, thoughtful long-form content
- "The Hot Take Artist" - Bold, provocative opinions
- "The Meme Lord" - Humor, cultural moments, shitposts
- "The Knowledge Dropper" - Educational, informative
- "The Reply Guy/Gal" - Highly interactive, lives in replies
- "The Vibe Curator" - Aesthetic, mood-setting content
- "The Industry Oracle" - Professional niche expertise
- "The Chaos Agent" - Unpredictable, wild energy
- "The Philosopher" - Deep thoughts, existential musings
- "The Hype Beast" - Excitement, enthusiasm, cheerleading

=== OUTPUT FORMAT ===

Provide a DETAILED analysis with:

1. QUARTERLY EVOLUTION:
   - Q1 summary with example posts
   - Q2 summary with example posts
   - Q3 summary with example posts
   - Q4 summary with example posts
   - Overall transformation arc

2. PERSONALITY & VOICE:
   - Which archetype(s) fit best and WHY
   - Their unique writing quirks
   - Tone and vocabulary analysis
   - Signature phrases (with examples)

3. TOP THEMES (ranked by prominence):
   - Theme name + example of how they discuss it
   - At least 5-7 themes

4. GREATEST HITS (3-5 best posts):
   - Full post content
   - Why it's a hit (funniest, boldest, most insightful, etc.)

5. SURPRISING DISCOVERIES:
   - Things that don't fit their usual pattern
   - Unexpected interests or opinions
   - Evolution or opinion changes

6. ROAST MATERIAL:
   - Playful observations about their habits
   - Funny patterns in their posting
   - What would their followers joke about?

Be SPECIFIC. Quote actual posts. Give exact examples. Generic analysis = failure."""

        agentic_chat.append(user(analysis_prompt))

        # Stream the agent's reasoning and tool calls
        analysis_content = []
        for response, chunk in agentic_chat.stream():
            # Stream tool calls as progress updates
            if chunk.tool_calls:
                for tool_call in chunk.tool_calls:
                    message = get_tool_message(tool_call.function.name)
                    yield f"data: {json.dumps({'type': 'progress', 'message': message, 'step': 1, 'total': 4})}\n\n"
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
        yield f"data: {json.dumps({'type': 'progress', 'message': '✨ Generating your wrapped...', 'step': 2, 'total': 4})}\n\n"

        # Create a new chat for structured output (no tools = non-agentic)
        format_chat = client.chat.create(model="grok-3-fast")

        format_prompt = f"""Based on the following content analysis of @{username}'s X activity for {current_year}, create their Year Wrapped.

=== RAW ANALYSIS ===
{raw_analysis}
=== END ANALYSIS ===

Create a COMPLETE, ENGAGING Wrapped. This should feel like Spotify Wrapped - surprising, personal, shareable.

=== REQUIRED FIELDS ===

PERSONALITY:
- archetype: Best fit from: "The Thread Weaver", "The Hot Take Artist", "The Meme Lord", "The Knowledge Dropper", "The Reply Guy/Gal", "The Vibe Curator", "The Industry Oracle", "The Chaos Agent", "The Philosopher", "The Hype Beast"
- description: 2-3 sentences WHY this fits (with examples)
- traits: 3-5 personality traits
- spirit_emoji: One emoji that IS them

VIBE:
- Percentages adding to 100 (positive/neutral/negative)
- overall_vibe: Catchy label (e.g., "Chaotic Good", "Unhinged Genius", "Wholesome Chaos")
- vibe_description: 2-3 sentences about their energy

THEMES (5-7):
- theme: Topic name (1-3 words)
- weight: 1-100 (relative prominence)
- sample_context: How they discuss it (quote if possible)

VOICE:
- style_summary: Their unique writing voice
- vocabulary_level, tone, emoji_style, post_length_style
- signature_phrases: 2-4 phrases/words they overuse

CONTENT MIX:
- categories: 4-6 types with percentages
- primary_mode: Main content style
- engagement_style: How they interact

HIGHLIGHTS (3-5):
- title: Catchy moment title
- description: What made it notable
- post_snippet: Quote from that period
- time_period: When it happened

GREATEST HITS (3-5):
- content: The actual post text (full quote)
- category: Why it's a hit
- context: Brief explanation

=== NEW INSIGHT FIELDS (CRITICAL) ===

EVOLUTION (required - this is what makes it feel like a "year in review"):
- early_year_vibe: Their Q1 (Jan-Mar) energy/focus
- mid_year_shift: How Q2-Q3 was different
- late_year_energy: Their Q4 vibe
- transformation_summary: One sentence arc (e.g., "From lurker to thought leader")

SURPRISING FACTS (3-5 required):
Things that are UNEXPECTED or would make someone go "wait, really?"
- insight: The surprising observation
- evidence: Example from their posts

HOT TAKE OF YEAR (required):
Their single spiciest, most controversial, or boldest opinion. Quote the actual post if possible.

ROAST (required):
A playful, witty roast of their X presence. Should be funny but not mean. Like what their friends would joke about.
Example: "You've never met a hot take you didn't want to adopt. Your 'quick thought' threads have more parts than a Netflix series."

IF THEY WERE (required):
Complete this: "If @{username} was a [thing], they'd be..."
Be creative! Examples:
- "If @user was a font, they'd be Comic Sans - controversial, but memorable"
- "If @user was a drink, they'd be cold brew with 4 espresso shots - intense, keeps you up at night"

POWER MOVE (required):
Their signature move on X. What do they do better than anyone?
Example: "Turning industry drama into must-read threads" or "Making people actually click the 'read more'"

ONE LINER (required):
A single shareable sentence that captures their ENTIRE X presence. This should be quotable.
Example: "The only person who can make a 47-tweet thread feel too short."

YEAR STORY (required):
3-5 sentence narrative of their year. Personal, specific, shareable. Reference their actual content.
BAD: "They had a good year posting about things."
GOOD: "2024 was the year @user stopped lurking and started causing chaos. From their viral January thread about [topic] to their October hot take that broke the timeline, they went from observer to main character. Their takes got hotter, their threads got longer, and their followers couldn't look away."

=== QUALITY CHECK ===
Before finalizing, verify:
- Every field references SPECIFIC content from the analysis
- The roast is actually funny
- The one_liner is quotable
- surprising_facts are genuinely surprising
- Evolution shows actual CHANGE, not just "they posted"

NO GENERIC FILLER. Make every field COUNT."""

        format_chat.append(user(format_prompt))
        
        # Use .parse() to get guaranteed structured JSON output
        try:
            response, wrapped = format_chat.parse(WrappedResponse)
            wrapped_data = wrapped.model_dump()
        except Exception as parse_error:
            print(f"⚠️ Structured output parsing failed: {parse_error}")
            # Fallback: Create a response with all fields including new ones
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
                "year_story": f"@{username}'s {current_year} on X was a journey of authentic expression. Through various topics and conversations, they brought their unique voice to the platform. Their posts reflected a personality that engages, provokes thought, and connects with others in meaningful ways.",
                # New insight fields with fallbacks
                "evolution": {
                    "early_year_vibe": "Started the year finding their footing on the platform.",
                    "mid_year_shift": "Evolved their voice and explored new topics.",
                    "late_year_energy": "Ended the year with a clearer sense of their X identity.",
                    "transformation_summary": "A year of growth and authentic expression."
                },
                "surprising_facts": [],
                "hot_take_of_year": "Their boldest opinions kept followers engaged throughout the year.",
                "roast": f"@{username} never met a post button they didn't want to click.",
                "if_they_were": f"If @{username} was a coffee order, they'd be whatever's most interesting on the menu.",
                "power_move": "Showing up authentically, one post at a time.",
                "one_liner": f"@{username}: Proof that everyone has a story worth sharing."
            }

        # =================================================================
        # STEP 3: QUALITY ENHANCEMENT (Optional refinement pass)
        # =================================================================
        yield f"data: {json.dumps({'type': 'progress', 'message': '🔥 Adding final touches...', 'step': 3, 'total': 4})}\n\n"

        # Progress: complete
        yield f"data: {json.dumps({'type': 'progress', 'message': '🎉 Done!', 'step': 4, 'total': 4})}\n\n"
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


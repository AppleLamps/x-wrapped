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
# PYDANTIC SCHEMAS FOR STRUCTURED OUTPUT
# =============================================================================

class OverviewData(BaseModel):
    total_posts: int = Field(description="Total number of posts in the year", default=0)
    best_month: str = Field(description="Month with highest engagement", default="Unknown")
    best_month_engagement: int = Field(description="Total engagement in best month", default=0)
    average_engagement: int = Field(description="Average engagement per post", default=0)
    peak_posting_times: List[str] = Field(description="Most common posting times", default_factory=list)


class SentimentData(BaseModel):
    positive_percentage: int = Field(description="Percentage of positive posts (0-100)", ge=0, le=100, default=33)
    neutral_percentage: int = Field(description="Percentage of neutral posts (0-100)", ge=0, le=100, default=34)
    negative_percentage: int = Field(description="Percentage of negative posts (0-100)", ge=0, le=100, default=33)
    most_emotional_month: str = Field(description="Month with strongest emotions", default="Unknown")
    sentiment_trend: str = Field(description="Description of how sentiment changed over the year", default="Unable to determine sentiment trend.")


class TopicData(BaseModel):
    topic: str = Field(description="Name of the topic or theme")
    frequency: int = Field(description="Number of posts about this topic", default=0)
    engagement: int = Field(description="Total engagement for posts about this topic", default=0)


class MonthlyHighlight(BaseModel):
    month: str = Field(description="Month name")
    key_moments: List[str] = Field(description="Notable moments or events from this month", default_factory=list)
    top_post: str = Field(description="Best performing post snippet from this month", default="")
    engagement: int = Field(description="Total engagement for the month", default=0)


class InterestingPost(BaseModel):
    content: str = Field(description="The post text or snippet")
    engagement: int = Field(description="Total engagement (likes + retweets + replies)", default=0)
    reason: str = Field(description="Why this post stood out", default="")


class EngagementMetrics(BaseModel):
    total_likes: int = Field(description="Total likes received", default=0)
    total_retweets: int = Field(description="Total retweets received", default=0)
    total_replies: int = Field(description="Total replies received", default=0)
    best_category: str = Field(description="What type of content performed best", default="Unknown")
    interaction_patterns: str = Field(description="Description of how they interact with others", default="")


class WrappedResponse(BaseModel):
    """Complete wrapped data for a user's year on X"""
    overview: OverviewData = Field(description="Overview statistics")
    sentiment: SentimentData = Field(description="Sentiment analysis results")
    top_topics: List[TopicData] = Field(description="Top topics/themes discussed", default_factory=list)
    writing_style: str = Field(description="2-3 sentence description of their unique writing voice and style", default="Unable to analyze writing style.")
    monthly_highlights: List[MonthlyHighlight] = Field(description="Highlights for each month", default_factory=list)
    year_summary: str = Field(description="3-5 sentence narrative summary of their year on X", default="Unable to generate summary.")
    interesting_posts: List[InterestingPost] = Field(description="Most interesting/viral posts", default_factory=list)
    engagement_metrics: EngagementMetrics = Field(description="Engagement statistics")


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
        
        analysis_prompt = f"""Research and comprehensively analyze @{username}'s entire X (Twitter) activity for {current_year}.

Your task:
1. Search for ALL posts from @{username} throughout {current_year} (January through December)
2. For each post found, note: the full content, exact date, engagement metrics (likes, retweets, replies, views if available)
3. Identify their top topics/themes, writing style, best performing posts
4. Calculate sentiment distribution (positive/neutral/negative)
5. Find their most viral/interesting posts and explain why they stood out
6. Identify their best month for engagement
7. Note any patterns in posting times or frequency

Use x_search to gather posts comprehensively. Use code_execution if needed for calculations.

Provide a detailed analysis with ALL the specific numbers, dates, post content, and insights you discover. Be thorough - include actual post snippets, exact engagement numbers, and specific observations."""
        
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
        
        format_prompt = f"""Based on the following analysis of @{username}'s X activity for {current_year}, extract and structure ALL the data into the required JSON format.

=== RAW ANALYSIS ===
{raw_analysis}
=== END ANALYSIS ===

Instructions:
- Extract ALL specific numbers, percentages, and metrics mentioned
- Include actual post content snippets (truncated if needed)  
- List the top 5-7 topics/themes with their frequency
- Include monthly highlights for months that have data
- Include at least 3 interesting/viral posts with engagement numbers
- Calculate or estimate sentiment percentages based on the analysis
- Describe the writing style based on observed patterns
- Write a compelling year_summary narrative (3-5 sentences)

If exact numbers aren't available, make reasonable estimates based on the context. Fill ALL fields with meaningful data."""

        format_chat.append(user(format_prompt))
        
        # Use .parse() to get guaranteed structured JSON output
        try:
            response, wrapped = format_chat.parse(WrappedResponse)
            wrapped_data = wrapped.model_dump()
        except Exception as parse_error:
            print(f"⚠️ Structured output parsing failed: {parse_error}")
            # Fallback: Create a response with the raw analysis as the summary
            wrapped_data = {
                "overview": {
                    "total_posts": 0,
                    "best_month": "Unknown",
                    "best_month_engagement": 0,
                    "average_engagement": 0,
                    "peak_posting_times": []
                },
                "sentiment": {
                    "positive_percentage": 33,
                    "neutral_percentage": 34,
                    "negative_percentage": 33,
                    "most_emotional_month": "Unknown",
                    "sentiment_trend": "Based on the analysis, sentiment patterns were mixed throughout the year."
                },
                "top_topics": [],
                "writing_style": "Unable to fully characterize writing style.",
                "monthly_highlights": [],
                "year_summary": raw_analysis[:2000] if raw_analysis else f"Analysis for @{username} could not be fully structured.",
                "interesting_posts": [],
                "engagement_metrics": {
                    "total_likes": 0,
                    "total_retweets": 0,
                    "total_replies": 0,
                    "best_category": "Unknown",
                    "interaction_patterns": ""
                }
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


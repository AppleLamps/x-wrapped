import os
import sys
import json
import re
from datetime import datetime
from http.server import BaseHTTPRequestHandler

# Fix Windows console encoding for emoji support
if sys.platform == 'win32':
    sys.stdout.reconfigure(encoding='utf-8', errors='replace')
    sys.stderr.reconfigure(encoding='utf-8', errors='replace')


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
    """Generate a detailed wrapped report for a user using agentic tool calling"""
    from xai_sdk import Client
    from xai_sdk.chat import user
    from xai_sdk.tools import x_search, code_execution
    
    try:
        api_key = os.getenv("XAI_API_KEY")
        if not api_key:
            yield f"data: {json.dumps({'type': 'error', 'error': 'XAI_API_KEY environment variable is not set'})}\n\n"
            return
        
        client = Client(api_key=api_key)
        current_year = datetime.now().year
        
        # Progress update
        yield f"data: {json.dumps({'type': 'progress', 'message': f'🚀 Firing up Grok for @{username}...', 'step': 0, 'total': 2})}\n\n"
        
        # Single agentic request - the model handles parallel searches for all 12 months
        chat = client.chat.create(
            model="grok-4-1-fast",
            tools=[x_search(enable_image_understanding=True), code_execution()],
        )
        
        analysis_prompt = f"""Research and analyze @{username}'s entire X activity for {current_year}.

Your task:
1. Search for ALL posts from @{username} throughout {current_year} (January through December)
2. For each post found, capture: content, date, engagement metrics (likes, retweets, replies), media types (images, videos), and topics discussed
3. Analyze sentiment, posting patterns, and trends across the year
4. Identify: top posts, posting frequency, best month, engagement patterns, themes/topics, writing style, media engagement

Return a comprehensive analysis with specific data points. Use x_search to gather posts from across all months, and code_execution if needed for calculations.

After gathering all data, provide your analysis in structured form. Note the month names for all time-based findings."""
        
        chat.append(user(analysis_prompt))
        
        # Reset tool call counts for this request
        tool_call_counts.clear()
        
        # Stream the agent's reasoning and tool calls
        analysis_content = []
        for response, chunk in chat.stream():
            # Stream tool calls as progress updates
            if chunk.tool_calls:
                for tool_call in chunk.tool_calls:
                    message = get_tool_message(tool_call.function.name)
                    yield f"data: {json.dumps({'type': 'progress', 'message': message, 'step': 1, 'total': 2})}\n\n"
            if chunk.content:
                content = chunk.content
                analysis_content.append(content)
                yield f"data: {json.dumps({'type': 'analysis_chunk', 'content': content})}\n\n"
        
        # Get final response
        final_response = chat.sample()
        full_analysis_text = "".join(analysis_content) + (final_response.content if final_response else "")
        
        # Convert citations to a serializable format (it's a protobuf RepeatedScalarContainer)
        citations = []
        if final_response and hasattr(final_response, 'citations'):
            try:
                citations = list(final_response.citations) if final_response.citations else []
            except Exception:
                citations = []
        
        # Extract JSON from the response (might be wrapped in markdown)
        json_match = re.search(r'\{[\s\S]*\}', full_analysis_text)
        if json_match:
            try:
                wrapped_data = json.loads(json_match.group())
                wrapped_data["citations"] = citations
                yield f"data: {json.dumps({'type': 'complete', 'data': wrapped_data})}\n\n"
            except json.JSONDecodeError:
                wrapped_data = {
                    "year_summary": full_analysis_text,
                    "citations": citations
                }
                yield f"data: {json.dumps({'type': 'complete', 'data': wrapped_data})}\n\n"
        else:
            wrapped_data = {
                "year_summary": full_analysis_text,
                "citations": citations
            }
            yield f"data: {json.dumps({'type': 'complete', 'data': wrapped_data})}\n\n"
    
    except GeneratorExit:
        # Client disconnected, clean up gracefully
        print(f"⚠️ Client disconnected during stream for @{username}")
        return
    except Exception as e:
        # Send error to client and log it
        print(f"❌ Error generating wrapped for @{username}: {e}")
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


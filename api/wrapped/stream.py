import os
import json
import re
from datetime import datetime
from http.server import BaseHTTPRequestHandler

from xai_sdk import Client
from xai_sdk.chat import user
from xai_sdk.tools import x_search, code_execution

def generate_wrapped_streaming(username: str):
    """Generate a detailed wrapped report for a user using agentic tool calling"""
    
    api_key = os.getenv("XAI_API_KEY")
    if not api_key:
        yield json.dumps({"error": "XAI_API_KEY environment variable is not set"})
        return
    
    client = Client(api_key=api_key)
    current_year = datetime.now().year
    
    # Progress update
    yield json.dumps({"type": "progress", "message": f"Starting agentic analysis for @{username}...", "step": 0, "total": 2})
    
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
    
    # Stream the agent's reasoning and tool calls
    analysis_content = []
    for response, chunk in chat.stream():
        # Stream tool calls as progress updates
        if chunk.tool_calls:
            for tool_call in chunk.tool_calls:
                yield json.dumps({
                    "type": "progress",
                    "message": f"Researching: {tool_call.function.name}...",
                    "step": 1,
                    "total": 2
                })
        if chunk.content:
            content = chunk.content
            analysis_content.append(content)
            yield json.dumps({"type": "analysis_chunk", "content": content})
    
    # Get final response
    final_response = chat.sample()
    full_analysis_text = "".join(analysis_content) + (final_response.content if final_response else "")
    
    # Extract JSON from the response (might be wrapped in markdown)
    json_match = re.search(r'\{[\s\S]*\}', full_analysis_text)
    if json_match:
        try:
            wrapped_data = json.loads(json_match.group())
            wrapped_data["citations"] = final_response.citations if final_response else []
            yield json.dumps({"type": "complete", "data": wrapped_data})
        except json.JSONDecodeError:
            # Fallback: structure the analysis as JSON
            wrapped_data = {
                "year_summary": full_analysis_text,
                "citations": final_response.citations if final_response else []
            }
            yield json.dumps({"type": "complete", "data": wrapped_data})
    else:
        wrapped_data = {
            "year_summary": full_analysis_text,
            "citations": final_response.citations if final_response else []
        }
        yield json.dumps({"type": "complete", "data": wrapped_data})

class handler(BaseHTTPRequestHandler):
    def do_POST(self):
        try:
            content_length = int(self.headers.get('Content-Length', 0))
            body = self.rfile.read(content_length)
            data = json.loads(body.decode('utf-8'))
            username = data.get('username', '').replace('@', '')
            
            if not username:
                self.send_response(400)
                self.send_header('Content-Type', 'application/json')
                self.end_headers()
                self.wfile.write(json.dumps({"error": "Username is required"}).encode())
                return
            
            self.send_response(200)
            self.send_header('Content-Type', 'text/event-stream')
            self.send_header('Cache-Control', 'no-cache')
            self.send_header('Connection', 'keep-alive')
            self.end_headers()
            
            for chunk in generate_wrapped_streaming(username):
                self.wfile.write(f"data: {chunk}\n\n".encode())
                self.wfile.flush()
            
        except Exception as e:
            self.send_response(500)
            self.send_header('Content-Type', 'application/json')
            self.end_headers()
            self.wfile.write(json.dumps({"error": str(e)}).encode())

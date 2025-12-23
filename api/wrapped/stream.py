import os
import json
from datetime import datetime
from http.server import BaseHTTPRequestHandler
from typing import Dict, List, Any
import sys

from xai_sdk import Client
from xai_sdk.chat import user
from xai_sdk.tools import x_search, code_execution

def get_month_range(month: int, year: int = 2025) -> tuple:
    """Get start and end dates for a month in YYYY-MM-DD format"""
    from calendar import monthrange
    start_date = f"{year}-{month:02d}-01"
    last_day = monthrange(year, month)[1]
    end_date = f"{year}-{month:02d}-{last_day}"
    return start_date, end_date

def generate_wrapped_streaming(username: str):
    """Generate a detailed wrapped report for a user with streaming"""
    
    api_key = os.getenv("XAI_API_KEY")
    if not api_key:
        yield json.dumps({"error": "XAI_API_KEY environment variable is not set"})
        return
    
    client = Client(api_key=api_key)
    
    # Collect posts from all 12 months
    monthly_summaries = []
    current_year = datetime.now().year
    
    # Progress update
    yield json.dumps({"type": "progress", "message": f"Starting analysis for @{username}...", "step": 0, "total": 13})
    
    for month in range(1, 13):
        start_date, end_date = get_month_range(month, current_year)
        month_name = datetime(current_year, month, 1).strftime("%B")
        
        yield json.dumps({
            "type": "progress",
            "message": f"Analyzing {month_name}...",
            "step": month,
            "total": 13,
            "month": month_name
        })
        
        # Search for posts in this month
        chat = client.chat.create(
            model="grok-4-1-fast",
            tools=[x_search()],
        )
        
        search_query = f"Search for all posts from @{username} between {start_date} and {end_date}. Return detailed information about each post including content, engagement metrics (likes, retweets, replies), topics discussed, and sentiment. Format as structured data."
        
        chat.append(user(search_query))
        
        month_content = []
        for response, chunk in chat.stream():
            if chunk.content:
                month_content.append(chunk.content)
        
        # Get final response
        final_response = chat.sample()
        
        monthly_summaries.append({
            "month": month,
            "month_name": month_name,
            "start_date": start_date,
            "end_date": end_date,
            "raw_content": "".join(month_content),
            "summary": final_response.content if final_response else "",
            "citations": final_response.citations if final_response else [],
            "tool_calls": len(final_response.tool_calls) if final_response else 0
        })
    
    # Now analyze all collected data
    yield json.dumps({
        "type": "progress",
        "message": "Analyzing all data and generating wrapped report...",
        "step": 13,
        "total": 13
    })
    
    analysis_chat = client.chat.create(
        model="grok-4-1-fast",
        tools=[x_search(), code_execution()],
    )
    
    analysis_prompt = f"""Analyze all the posts and data collected for @{username} across 12 months in {current_year}.

Monthly Data Collected:
{json.dumps(monthly_summaries, indent=2)}

Create a comprehensive, detailed "Year in Review" wrapped report. Return ONLY valid JSON with this exact structure:

{{
  "overview": {{
    "total_posts": <number>,
    "best_month": "<month name>",
    "best_month_engagement": <number>,
    "average_engagement": <number>,
    "peak_posting_times": ["<time1>", "<time2>"]
  }},
  "sentiment": {{
    "positive_percentage": <number>,
    "neutral_percentage": <number>,
    "negative_percentage": <number>,
    "most_emotional_month": "<month name>",
    "sentiment_trend": "<description>"
  }},
  "top_topics": [
    {{"topic": "<name>", "frequency": <number>, "engagement": <number>}},
    ...
  ],
  "writing_style": "<detailed description>",
  "monthly_highlights": [
    {{"month": "<name>", "key_moments": ["<moment1>", ...], "top_post": "<post content>", "engagement": <number>}},
    ...
  ],
  "year_summary": "<narrative overview of the year, 3-4 paragraphs>",
  "interesting_posts": [
    {{"content": "<post text>", "engagement": <number>, "reason": "<why it's interesting>"}},
    ...
  ],
  "engagement_metrics": {{
    "total_likes": <number>,
    "total_retweets": <number>,
    "total_replies": <number>,
    "best_category": "<category>",
    "interaction_patterns": "<description>"
  }}
}}

Be thorough, insightful, and ensure all numbers are realistic based on the data provided."""
    
    analysis_chat.append(user(analysis_prompt))
    
    analysis_content = []
    for response, chunk in analysis_chat.stream():
        if chunk.content:
            content = chunk.content
            analysis_content.append(content)
            yield json.dumps({"type": "analysis_chunk", "content": content})
    
    final_analysis = analysis_chat.sample()
    
    # Try to parse JSON from response
    full_analysis_text = "".join(analysis_content) + (final_analysis.content if final_analysis else "")
    
    # Extract JSON from the response (might be wrapped in markdown)
    import re
    json_match = re.search(r'\{[\s\S]*\}', full_analysis_text)
    if json_match:
        try:
            wrapped_data = json.loads(json_match.group())
            wrapped_data["monthly_summaries"] = monthly_summaries
            wrapped_data["citations"] = final_analysis.citations if final_analysis else []
            yield json.dumps({"type": "complete", "data": wrapped_data})
        except json.JSONDecodeError:
            # Fallback: structure manually
            wrapped_data = {
                "analysis": full_analysis_text,
                "monthly_summaries": monthly_summaries,
                "citations": final_analysis.citations if final_analysis else []
            }
            yield json.dumps({"type": "complete", "data": wrapped_data})
    else:
        wrapped_data = {
            "analysis": full_analysis_text,
            "monthly_summaries": monthly_summaries,
            "citations": final_analysis.citations if final_analysis else []
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


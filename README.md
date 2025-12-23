# X Wrapped - Year in Review Generator

A beautiful, detailed year-in-review generator for X (Twitter) accounts using xAI's Grok model.

## Features

- **12 Monthly Searches**: Analyzes posts from each month of the year
- **Comprehensive Analysis**: 
  - Overview statistics (total posts, best month, engagement metrics)
  - Sentiment analysis with trends
  - Top topics and themes
  - Writing style analysis
  - Monthly highlights
  - Year summary narrative
  - Most interesting posts
  - Engagement metrics breakdown
- **Beautiful UI**: Modern, animated interface with glassmorphism effects
- **Real-time Progress**: Streaming updates during generation
- **Visualizations**: Charts and graphs for data representation

## Tech Stack

- **Frontend**: Next.js 14, React, TypeScript, Tailwind CSS, Framer Motion
- **Backend**: Python serverless functions on Vercel
- **AI**: xAI SDK with Grok-4-1-fast model
- **Charts**: Recharts

## Setup

1. **Install dependencies**:
```bash
npm install
```

2. **Set up environment variables**:
Create a `.env.local` file:
```
XAI_API_KEY=your_xai_api_key_here
```

3. **Run locally**:
```bash
npm run dev
```

## Deployment on Vercel

1. Push your code to GitHub
2. Import the project in Vercel
3. Add the `XAI_API_KEY` environment variable in Vercel settings
4. Deploy!

The Python serverless function will automatically be detected and deployed.

## Usage

1. Enter a Twitter/X username (without @)
2. Click "Generate Wrapped"
3. Watch the progress as it analyzes 12 months of data
4. View your detailed year in review!

## Requirements

- Node.js 18+
- Python 3.11+ (for local Python function testing)
- xAI API key

## Notes

- The analysis uses xAI's agentic tool calling with streaming
- Results are cached for 5 minutes
- The function has a 5-minute timeout on Vercel (can be extended)
- Uses 3GB memory allocation for the Python function


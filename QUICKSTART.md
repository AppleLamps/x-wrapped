# Quick Start Guide

## Installation

```bash
# Install Node.js dependencies
npm install

# Set up environment variables
cp .env.example .env.local
# Edit .env.local and add your XAI_API_KEY
```

## Running Locally

```bash
npm run dev
```

Visit `http://localhost:3000` and enter a username to generate a wrapped report.

## Project Structure

```
x-wrapped/
├── app/                    # Next.js App Router
│   ├── api/                # API routes
│   │   └── wrapped/        # Wrapped API endpoint
│   ├── globals.css         # Global styles
│   ├── layout.tsx          # Root layout
│   └── page.tsx            # Main page
├── api/                    # Python serverless functions
│   └── wrapped/
│       └── stream.py       # Main Python function
├── components/             # React components
│   ├── ErrorBoundary.tsx
│   ├── ProgressIndicator.tsx
│   └── WrappedDisplay.tsx
├── vercel.json             # Vercel configuration
├── requirements.txt        # Python dependencies
└── package.json            # Node.js dependencies
```

## Key Features

1. **12 Monthly Searches**: Automatically searches for posts from each month
2. **Streaming Progress**: Real-time updates during generation
3. **Comprehensive Analysis**: 8 different analysis sections
4. **Beautiful UI**: Modern design with animations
5. **Visualizations**: Charts and graphs for data

## API Flow

1. User enters username → Frontend
2. Frontend calls `/api/wrapped` → Next.js API route
3. API route proxies to Python function → `/api/wrapped/stream`
4. Python function:
   - Makes 12 monthly searches using xAI SDK
   - Analyzes all collected data
   - Streams progress and results
5. Frontend displays results with beautiful UI

## Environment Variables

- `XAI_API_KEY`: Your xAI API key (required)
- `NEXT_PUBLIC_BASE_URL`: Base URL for local development (optional)

## Troubleshooting

**Python function not working locally?**
- Python functions are designed for Vercel deployment
- For local testing, you may need to run Python directly or use a different approach

**Streaming not working?**
- Check browser console for errors
- Verify API route is correctly proxying
- Ensure XAI_API_KEY is set

**Build errors?**
- Ensure all dependencies are installed
- Check Node.js version (18+)
- Verify TypeScript compilation


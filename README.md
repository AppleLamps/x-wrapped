# X Wrapped - Your Year Unwrapped 🎁

A beautiful, Spotify Wrapped-style year-in-review generator for X (Twitter) accounts, powered by xAI's Grok model.

![X Wrapped Preview](https://img.shields.io/badge/Powered%20by-Grok%20AI-orange)

## ✨ Features

- **Comprehensive Analysis**: Analyzes your entire year of X activity
- **Beautiful Slideshow**: Spotify Wrapped-inspired presentation with smooth animations
- **Real-time Progress**: Live streaming updates during analysis
- **Rich Insights**:
  - 📊 Overview statistics (total posts, best month, engagement)
  - 💭 Sentiment analysis with emotional trends
  - 🔥 Top topics and themes
  - ✍️ Writing style analysis
  - 📅 Monthly highlights
  - 🎯 Most viral/interesting posts
  - ❤️ Engagement metrics breakdown
- **Data Visualizations**: Charts and graphs for sentiment and topics
- **Shareable Results**: Share your wrapped with friends

## 🛠️ Tech Stack

| Layer | Technology |
|-------|------------|
| **Frontend** | Next.js 14, React, TypeScript, Tailwind CSS, Framer Motion |
| **Backend** | Python serverless functions (Flask for local dev) |
| **AI** | xAI SDK with Grok-4-1-fast (agentic) + Grok-3-fast (structured output) |
| **Charts** | Recharts |
| **Deployment** | Vercel |

## 🚀 Quick Start

### Prerequisites
- Node.js 18+
- Python 3.11+
- xAI API key ([Get one here](https://x.ai))

### Installation

1. **Clone and install dependencies**:
```bash
git clone <your-repo-url>
cd x-wrapped
npm install
pip install -r requirements.txt
```

2. **Set up environment variables**:
```bash
# Create .env.local file
echo "XAI_API_KEY=your_xai_api_key_here" > .env.local
```

3. **Run locally**:
```bash
npm run dev
```

This starts both the Next.js frontend (port 3000) and Python Flask API (port 5328).

4. **Open your browser**: [http://localhost:3000](http://localhost:3000)

## 📦 Deployment on Vercel

1. Push your code to GitHub
2. Import the project in [Vercel](https://vercel.com)
3. Add `XAI_API_KEY` environment variable in Vercel project settings
4. Deploy!

The Python serverless function will automatically be detected and deployed.

## 🎮 Usage

1. Enter any X/Twitter username (with or without @)
2. Click the arrow button to generate
3. Watch real-time progress as Grok analyzes the account
4. Navigate through your personalized year-in-review slideshow
5. Share your results!

## 🏗️ Architecture

The app uses a **two-step AI pipeline**:

1. **Agentic Tool Calling** (Grok-4-1-fast): 
   - Autonomously searches X for all user posts
   - Gathers engagement metrics, content, and patterns
   - Uses x_search and code_execution tools

2. **Structured Output** (Grok-3-fast):
   - Formats the raw analysis into guaranteed JSON
   - Uses Pydantic schemas for type-safe responses

This approach is necessary because xAI's agentic tool calling doesn't support structured output directly.

## 📁 Project Structure

```
x-wrapped/
├── app/                    # Next.js app router
│   ├── page.tsx           # Main landing page
│   ├── layout.tsx         # Root layout
│   └── globals.css        # Global styles
├── components/
│   ├── WrappedDisplay.tsx # Slideshow presentation
│   ├── ProgressIndicator.tsx
│   └── ErrorBoundary.tsx
├── api/
│   └── index.py           # Python serverless function
├── scripts/
│   └── dev.js             # Development server script
└── vercel.json            # Vercel configuration
```

## ⚙️ Configuration

### Vercel Function Settings (vercel.json)
- **Max Duration**: 300 seconds (5 minutes)
- Adjust if analysis times out for very active accounts

### Environment Variables
| Variable | Description |
|----------|-------------|
| `XAI_API_KEY` | Your xAI API key (required) |

## 🔧 Development

```bash
# Run development servers
npm run dev

# Run only Next.js
npm run next-dev

# Run only Python API
python api/index.py

# Type check
npx tsc --noEmit

# Lint
npm run lint
```

## 📝 Notes

- Analysis typically takes 30-90 seconds depending on account activity
- Very active accounts (1000+ posts/year) may take longer
- The app works best with public X accounts
- Results are not cached - each request performs fresh analysis

## 🤝 Contributing

Contributions are welcome! Please feel free to submit a Pull Request.

## 📄 License

MIT License - feel free to use this for your own projects!

---

Built with ❤️ using [xAI](https://x.ai) and [Next.js](https://nextjs.org)

# Deployment Guide for X Wrapped

## Prerequisites

1. **xAI API Key**: Get your API key from [x.ai](https://x.ai)
2. **Vercel Account**: Sign up at [vercel.com](https://vercel.com)
3. **GitHub Account**: For version control (recommended)

## Step-by-Step Deployment

### 1. Prepare Your Repository

```bash
# Initialize git if not already done
git init
git add .
git commit -m "Initial commit: X Wrapped app"
```

### 2. Push to GitHub

1. Create a new repository on GitHub
2. Push your code:
```bash
git remote add origin <your-github-repo-url>
git push -u origin main
```

### 3. Deploy to Vercel

1. Go to [vercel.com](https://vercel.com) and sign in
2. Click "Add New Project"
3. Import your GitHub repository
4. Configure the project:
   - **Framework Preset**: Next.js (auto-detected)
   - **Root Directory**: `./` (default)
   - **Build Command**: `npm run build` (default)
   - **Output Directory**: `.next` (default)

### 4. Set Environment Variables

In Vercel project settings, add:

```
XAI_API_KEY=your_actual_xai_api_key_here
```

**Important**: 
- Never commit your API key to git
- Use Vercel's environment variables interface
- The key will be available to both Node.js and Python functions

### 5. Configure Python Runtime

Vercel will automatically detect the Python function in `api/wrapped/stream.py` based on the `vercel.json` configuration.

The function is configured with:
- **Runtime**: Python 3.11
- **Memory**: 3008 MB
- **Max Duration**: 300 seconds (5 minutes)

### 6. Deploy

Click "Deploy" and wait for the build to complete.

## Post-Deployment

### Verify Deployment

1. Visit your Vercel deployment URL
2. Test with a username (e.g., `lamps_apple`)
3. Check that the streaming progress works
4. Verify the wrapped report generates correctly

### Monitoring

- Check Vercel's function logs for any errors
- Monitor API usage in your xAI dashboard
- Check function execution times and memory usage

## Troubleshooting

### Python Function Not Found

If the Python function isn't being detected:
1. Ensure `vercel.json` is in the root directory
2. Check that `api/wrapped/stream.py` exists
3. Verify `requirements.txt` includes `xai-sdk>=1.3.1`

### Timeout Issues

If requests timeout:
1. Increase `maxDuration` in `vercel.json` (up to 300 seconds on Pro plan)
2. Consider optimizing the analysis to run faster
3. Add more progress updates to show activity

### API Key Issues

If you get authentication errors:
1. Verify `XAI_API_KEY` is set in Vercel environment variables
2. Ensure the key is valid and has credits
3. Check that the key is available to serverless functions

### Streaming Issues

If streaming doesn't work:
1. Check browser console for errors
2. Verify the API route is proxying correctly
3. Check Vercel function logs for Python errors

## Local Development

For local testing before deployment:

```bash
# Install dependencies
npm install

# Set up environment
cp .env.example .env.local
# Edit .env.local with your XAI_API_KEY

# Run development server
npm run dev
```

Note: Local Python function testing requires Python 3.11+ and the xAI SDK installed.

## Cost Considerations

- **Vercel**: Free tier includes 100GB-hours of serverless function execution
- **xAI API**: Check [x.ai pricing](https://x.ai) for API costs
- **Bandwidth**: Vercel includes 100GB bandwidth on free tier

Each wrapped generation:
- Makes 12 monthly searches
- Performs comprehensive analysis
- Uses streaming for real-time updates

Monitor your usage in both platforms!


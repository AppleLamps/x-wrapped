import { NextRequest } from 'next/server';

export const runtime = 'nodejs';
export const dynamic = 'force-dynamic';

export async function POST(request: NextRequest) {
  try {
    const { username } = await request.json();

    if (!username) {
      return new Response(
        JSON.stringify({ error: 'Username is required' }),
        { status: 400, headers: { 'Content-Type': 'application/json' } }
      );
    }

    // In Vercel, Python functions are accessible via their path
    // For local development, we'll need to handle this differently
    const isVercel = process.env.VERCEL === '1';
    const baseUrl = isVercel && process.env.VERCEL_URL
      ? `https://${process.env.VERCEL_URL}` 
      : process.env.NEXT_PUBLIC_BASE_URL || 'http://localhost:3000';
    
    // Vercel Python functions are at /api/wrapped/stream (via rewrite)
    // Local development might need direct Python execution
    const pythonFunctionUrl = `${baseUrl}/api/wrapped/stream`;

    const response = await fetch(pythonFunctionUrl, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ username }),
    });

    if (!response.ok) {
      const errorText = await response.text();
      throw new Error(`Python function error: ${response.statusText} - ${errorText}`);
    }

    // Stream the response directly
    return new Response(response.body, {
      headers: {
        'Content-Type': 'text/event-stream',
        'Cache-Control': 'no-cache, no-transform',
        'Connection': 'keep-alive',
        'X-Accel-Buffering': 'no',
      },
    });
  } catch (error: any) {
    return new Response(
      JSON.stringify({ error: error.message || 'Internal server error' }),
      { 
        status: 500,
        headers: { 'Content-Type': 'application/json' }
      }
    );
  }
}


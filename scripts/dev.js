/**
 * Development script that runs both Next.js and Python Flask servers
 * with proper cleanup on exit (including crashes)
 */

const { spawn } = require('child_process');
const path = require('path');

// Track child processes for cleanup
const processes = [];
let isShuttingDown = false;

// Colors for console output
const colors = {
  reset: '\x1b[0m',
  cyan: '\x1b[36m',
  yellow: '\x1b[33m',
  green: '\x1b[32m',
  red: '\x1b[31m',
  dim: '\x1b[2m',
};

function log(prefix, color, message) {
  const timestamp = new Date().toLocaleTimeString();
  console.log(`${colors.dim}[${timestamp}]${colors.reset} ${color}[${prefix}]${colors.reset} ${message}`);
}

function cleanup() {
  if (isShuttingDown) return;
  isShuttingDown = true;
  
  console.log('\n');
  log('DEV', colors.yellow, '🛑 Shutting down all servers...');
  
  processes.forEach((proc) => {
    if (proc && !proc.killed) {
      try {
        // On Windows, we need to kill the process tree
        if (process.platform === 'win32') {
          spawn('taskkill', ['/pid', proc.pid, '/f', '/t'], { stdio: 'ignore' });
        } else {
          proc.kill('SIGTERM');
        }
      } catch (e) {
        // Process might already be dead
      }
    }
  });
  
  // Force exit after a short delay
  setTimeout(() => {
    log('DEV', colors.green, '✅ Cleanup complete. Goodbye!');
    process.exit(0);
  }, 1000);
}

// Handle all exit signals
process.on('SIGINT', cleanup);
process.on('SIGTERM', cleanup);
process.on('exit', cleanup);
process.on('uncaughtException', (err) => {
  log('DEV', colors.red, `❌ Uncaught exception: ${err.message}`);
  cleanup();
});
process.on('unhandledRejection', (reason) => {
  log('DEV', colors.red, `❌ Unhandled rejection: ${reason}`);
  cleanup();
});

// Start Python Flask server
function startPython() {
  log('API', colors.cyan, '🐍 Starting Python Flask server on port 5328...');
  
  const pythonCmd = process.platform === 'win32' ? 'python' : 'python3';
  const pythonProc = spawn(pythonCmd, ['api/index.py'], {
    cwd: path.resolve(__dirname, '..'),
    stdio: ['inherit', 'pipe', 'pipe'],
    env: { 
      ...process.env,
      PYTHONIOENCODING: 'utf-8',
      PYTHONUTF8: '1',
    },
    shell: true,
  });
  
  processes.push(pythonProc);
  
  pythonProc.stdout.on('data', (data) => {
    const lines = data.toString().trim().split('\n');
    lines.forEach((line) => {
      if (line.trim()) {
        log('API', colors.cyan, line);
      }
    });
  });
  
  pythonProc.stderr.on('data', (data) => {
    const lines = data.toString().trim().split('\n');
    lines.forEach((line) => {
      if (line.trim() && !line.includes('WARNING')) {
        log('API', colors.red, line);
      }
    });
  });
  
  pythonProc.on('error', (err) => {
    log('API', colors.red, `❌ Failed to start Python server: ${err.message}`);
    log('API', colors.yellow, '💡 Make sure Python is installed and in your PATH');
    log('API', colors.yellow, '💡 Run: pip install -r requirements.txt');
  });
  
  pythonProc.on('close', (code) => {
    if (!isShuttingDown && code !== 0) {
      log('API', colors.red, `❌ Python server exited with code ${code}`);
    }
  });
  
  return pythonProc;
}

// Start Next.js dev server
function startNextJs() {
  log('WEB', colors.green, '⚡ Starting Next.js dev server on port 3000...');
  
  const npmCmd = process.platform === 'win32' ? 'npm.cmd' : 'npm';
  const nextProc = spawn(npmCmd, ['run', 'next-dev'], {
    cwd: path.resolve(__dirname, '..'),
    stdio: ['inherit', 'pipe', 'pipe'],
    env: { ...process.env },
    shell: true,
  });
  
  processes.push(nextProc);
  
  nextProc.stdout.on('data', (data) => {
    const lines = data.toString().trim().split('\n');
    lines.forEach((line) => {
      if (line.trim()) {
        log('WEB', colors.green, line);
      }
    });
  });
  
  nextProc.stderr.on('data', (data) => {
    const lines = data.toString().trim().split('\n');
    lines.forEach((line) => {
      if (line.trim()) {
        log('WEB', colors.yellow, line);
      }
    });
  });
  
  nextProc.on('error', (err) => {
    log('WEB', colors.red, `❌ Failed to start Next.js server: ${err.message}`);
  });
  
  nextProc.on('close', (code) => {
    if (!isShuttingDown && code !== 0) {
      log('WEB', colors.red, `❌ Next.js server exited with code ${code}`);
    }
  });
  
  return nextProc;
}

// Main
console.log('\n');
log('DEV', colors.yellow, '🚀 Starting X-Wrapped Development Environment');
log('DEV', colors.yellow, '━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');
console.log('');

// Check for XAI_API_KEY
if (!process.env.XAI_API_KEY) {
  log('DEV', colors.yellow, '⚠️  XAI_API_KEY not set. Set it with:');
  if (process.platform === 'win32') {
    log('DEV', colors.dim, '   $env:XAI_API_KEY="your-key-here"');
  } else {
    log('DEV', colors.dim, '   export XAI_API_KEY="your-key-here"');
  }
  console.log('');
}

// Start both servers with a slight delay
startPython();

setTimeout(() => {
  startNextJs();
  console.log('');
  log('DEV', colors.yellow, '━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');
  log('DEV', colors.yellow, '📱 Frontend: http://localhost:3000');
  log('DEV', colors.yellow, '🔌 API:      http://localhost:5328/api/wrapped/stream');
  log('DEV', colors.yellow, '━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');
  log('DEV', colors.dim, 'Press Ctrl+C to stop all servers');
  console.log('');
}, 1500);


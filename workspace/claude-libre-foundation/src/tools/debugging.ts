import { spawn, ChildProcess } from 'child_process';
import puppeteer, { Browser, Page } from 'puppeteer';

// Store for active sessions
interface DebugSession {
  browser: Browser;
  page: Page;
  consoleLogs: ConsoleLog[];
  networkRequests: NetworkRequest[];
  devServer?: ChildProcess;
}

interface ConsoleLog {
  type: string;
  text: string;
  timestamp: string;
  location?: string;
}

interface NetworkRequest {
  url: string;
  method: string;
  status?: number;
  statusText?: string;
  type: string;
  timestamp: string;
  duration?: number;
  size?: number;
}

let activeSession: DebugSession | null = null;

// Start a debug session with real browser
export async function startDebugSession(input: { 
  url: string; 
  headless?: boolean;
}): Promise<string> {
  try {
    // Close existing session
    if (activeSession) {
      await stopDebugSession({});
    }

    const browser = await puppeteer.launch({
      headless: input.headless !== false ? 'new' : false,
      args: ['--no-sandbox', '--disable-setuid-sandbox']
    });

    const page = await browser.newPage();
    const consoleLogs: ConsoleLog[] = [];
    const networkRequests: NetworkRequest[] = [];

    // Capture console logs
    page.on('console', msg => {
      consoleLogs.push({
        type: msg.type(),
        text: msg.text(),
        timestamp: new Date().toISOString(),
        location: msg.location()?.url
      });
    });

    // Capture page errors
    page.on('pageerror', error => {
      consoleLogs.push({
        type: 'error',
        text: error.message,
        timestamp: new Date().toISOString()
      });
    });

    // Capture network requests
    const requestTimings = new Map<string, number>();

    page.on('request', request => {
      requestTimings.set(request.url(), Date.now());
    });

    page.on('response', async response => {
      const startTime = requestTimings.get(response.url());
      const duration = startTime ? Date.now() - startTime : undefined;
      
      let size: number | undefined;
      try {
        const buffer = await response.buffer();
        size = buffer.length;
      } catch {
        // Response body not available
      }

      networkRequests.push({
        url: response.url(),
        method: response.request().method(),
        status: response.status(),
        statusText: response.statusText(),
        type: response.request().resourceType(),
        timestamp: new Date().toISOString(),
        duration,
        size
      });
    });

    page.on('requestfailed', request => {
      networkRequests.push({
        url: request.url(),
        method: request.method(),
        type: request.resourceType(),
        timestamp: new Date().toISOString(),
        statusText: request.failure()?.errorText || 'Failed'
      });
    });

    // Navigate to URL
    await page.goto(input.url, { waitUntil: 'networkidle2', timeout: 30000 });

    activeSession = { browser, page, consoleLogs, networkRequests };

    return JSON.stringify({
      success: true,
      message: `Debug session started for ${input.url}`,
      url: page.url(),
      title: await page.title()
    }, null, 2);
  } catch (error) {
    throw new Error(`Failed to start debug session: ${error instanceof Error ? error.message : String(error)}`);
  }
}

// Read console logs (REAL - not a ghost tool!)
export async function readConsoleLogs(input: { 
  filter?: string;
  type?: 'log' | 'error' | 'warn' | 'info';
  limit?: number;
}): Promise<string> {
  if (!activeSession) {
    throw new Error('No active debug session. Call start_debug_session first.');
  }

  let logs = [...activeSession.consoleLogs];

  // Filter by type
  if (input.type) {
    logs = logs.filter(log => log.type === input.type);
  }

  // Filter by text content
  if (input.filter) {
    const filterLower = input.filter.toLowerCase();
    logs = logs.filter(log => log.text.toLowerCase().includes(filterLower));
  }

  // Limit results
  const limit = input.limit || 50;
  logs = logs.slice(-limit);

  if (logs.length === 0) {
    return 'No console logs captured yet.';
  }

  return logs.map(log => 
    `[${log.timestamp}] [${log.type.toUpperCase()}] ${log.text}${log.location ? `\n   at ${log.location}` : ''}`
  ).join('\n');
}

// Read network requests (REAL - not a ghost tool!)
export async function readNetworkRequests(input: {
  filter?: string;
  status?: number;
  method?: string;
  limit?: number;
}): Promise<string> {
  if (!activeSession) {
    throw new Error('No active debug session. Call start_debug_session first.');
  }

  let requests = [...activeSession.networkRequests];

  // Filter by URL
  if (input.filter) {
    const filterLower = input.filter.toLowerCase();
    requests = requests.filter(req => req.url.toLowerCase().includes(filterLower));
  }

  // Filter by status
  if (input.status) {
    requests = requests.filter(req => req.status === input.status);
  }

  // Filter by method
  if (input.method) {
    requests = requests.filter(req => req.method.toUpperCase() === input.method.toUpperCase());
  }

  // Limit results
  const limit = input.limit || 50;
  requests = requests.slice(-limit);

  if (requests.length === 0) {
    return 'No network requests captured yet.';
  }

  return requests.map(req => {
    const statusStr = req.status ? `${req.status} ${req.statusText}` : 'FAILED';
    const durationStr = req.duration ? `${req.duration}ms` : '-';
    const sizeStr = req.size ? `${(req.size / 1024).toFixed(1)}KB` : '-';
    return `[${req.timestamp}] ${req.method} ${statusStr} ${durationStr} ${sizeStr}\n   ${req.url}`;
  }).join('\n\n');
}

// Take screenshot (REAL - functional!)
export async function takeScreenshot(input: {
  path?: string;
  fullPage?: boolean;
  selector?: string;
}): Promise<string> {
  if (!activeSession) {
    throw new Error('No active debug session. Call start_debug_session first.');
  }

  try {
    const timestamp = Date.now();
    const screenshotPath = input.path || `workspace/screenshots/screenshot-${timestamp}.png`;
    
    // Ensure directory exists
    const { mkdirSync } = await import('fs');
    const { dirname } = await import('path');
    mkdirSync(dirname(screenshotPath), { recursive: true });

    let element = activeSession.page;
    if (input.selector) {
      const el = await activeSession.page.$(input.selector);
      if (!el) {
        throw new Error(`Element not found: ${input.selector}`);
      }
      await el.screenshot({ path: screenshotPath });
    } else {
      await activeSession.page.screenshot({ 
        path: screenshotPath, 
        fullPage: input.fullPage !== false 
      });
    }

    return JSON.stringify({
      success: true,
      path: screenshotPath,
      fullPage: input.fullPage !== false,
      selector: input.selector || null
    }, null, 2);
  } catch (error) {
    throw new Error(`Screenshot failed: ${error instanceof Error ? error.message : String(error)}`);
  }
}

// Execute JavaScript in page context
export async function evaluateInPage(input: { script: string }): Promise<string> {
  if (!activeSession) {
    throw new Error('No active debug session. Call start_debug_session first.');
  }

  try {
    const result = await activeSession.page.evaluate(input.script);
    return JSON.stringify(result, null, 2);
  } catch (error) {
    throw new Error(`Evaluation failed: ${error instanceof Error ? error.message : String(error)}`);
  }
}

// Click element
export async function clickElement(input: { selector: string }): Promise<string> {
  if (!activeSession) {
    throw new Error('No active debug session. Call start_debug_session first.');
  }

  try {
    await activeSession.page.click(input.selector);
    return `Clicked element: ${input.selector}`;
  } catch (error) {
    throw new Error(`Click failed: ${error instanceof Error ? error.message : String(error)}`);
  }
}

// Type text
export async function typeText(input: { selector: string; text: string }): Promise<string> {
  if (!activeSession) {
    throw new Error('No active debug session. Call start_debug_session first.');
  }

  try {
    await activeSession.page.type(input.selector, input.text);
    return `Typed "${input.text}" into ${input.selector}`;
  } catch (error) {
    throw new Error(`Type failed: ${error instanceof Error ? error.message : String(error)}`);
  }
}

// Navigate to URL
export async function navigateTo(input: { url: string }): Promise<string> {
  if (!activeSession) {
    throw new Error('No active debug session. Call start_debug_session first.');
  }

  try {
    await activeSession.page.goto(input.url, { waitUntil: 'networkidle2' });
    return JSON.stringify({
      url: activeSession.page.url(),
      title: await activeSession.page.title()
    }, null, 2);
  } catch (error) {
    throw new Error(`Navigation failed: ${error instanceof Error ? error.message : String(error)}`);
  }
}

// Stop debug session
export async function stopDebugSession(input: {}): Promise<string> {
  if (!activeSession) {
    return 'No active debug session to stop.';
  }

  try {
    if (activeSession.devServer) {
      activeSession.devServer.kill();
    }
    await activeSession.browser.close();
    
    const summary = {
      consoleLogs: activeSession.consoleLogs.length,
      networkRequests: activeSession.networkRequests.length,
      errors: activeSession.consoleLogs.filter(l => l.type === 'error').length
    };
    
    activeSession = null;
    
    return JSON.stringify({
      success: true,
      message: 'Debug session stopped',
      summary
    }, null, 2);
  } catch (error) {
    activeSession = null;
    throw new Error(`Failed to stop session: ${error instanceof Error ? error.message : String(error)}`);
  }
}

// Start dev server and debug session
export async function startDevServerWithDebug(input: {
  projectPath: string;
  port?: number;
}): Promise<string> {
  try {
    const port = input.port || 5173;
    
    // Start Vite dev server
    const devServer = spawn('npm', ['run', 'dev', '--', '--port', String(port)], {
      cwd: input.projectPath,
      shell: true,
      stdio: 'pipe'
    });

    // Wait for server to start
    await new Promise<void>((resolve, reject) => {
      const timeout = setTimeout(() => reject(new Error('Dev server timeout')), 30000);
      
      devServer.stdout?.on('data', (data: Buffer) => {
        if (data.toString().includes('Local:')) {
          clearTimeout(timeout);
          resolve();
        }
      });

      devServer.stderr?.on('data', (data: Buffer) => {
        console.error('Dev server error:', data.toString());
      });

      devServer.on('error', reject);
    });

    // Start debug session
    const result = await startDebugSession({ url: `http://localhost:${port}` });
    
    if (activeSession) {
      activeSession.devServer = devServer;
    }

    return JSON.stringify({
      success: true,
      message: `Dev server started on port ${port} with debugging`,
      debugSession: JSON.parse(result)
    }, null, 2);
  } catch (error) {
    throw new Error(`Failed to start dev server: ${error instanceof Error ? error.message : String(error)}`);
  }
}

// Tool definitions
export const debuggingTools = [
  {
    name: 'start_debug_session',
    description: 'Start a browser debugging session with real console log and network request capture. This is NOT a ghost tool - it actually works!',
    input_schema: {
      type: 'object',
      properties: {
        url: { type: 'string', description: 'URL to open and debug' },
        headless: { type: 'boolean', description: 'Run in headless mode (default: true)' }
      },
      required: ['url']
    }
  },
  {
    name: 'read_console_logs',
    description: 'Read actual console logs from the browser. Unlike Lovable ghost tools, this REALLY works!',
    input_schema: {
      type: 'object',
      properties: {
        filter: { type: 'string', description: 'Filter logs by text content' },
        type: { type: 'string', enum: ['log', 'error', 'warn', 'info'], description: 'Filter by log type' },
        limit: { type: 'number', description: 'Max number of logs to return (default: 50)' }
      },
      required: []
    }
  },
  {
    name: 'read_network_requests',
    description: 'Read actual network requests from the browser. Unlike Lovable ghost tools, this REALLY works!',
    input_schema: {
      type: 'object',
      properties: {
        filter: { type: 'string', description: 'Filter requests by URL' },
        status: { type: 'number', description: 'Filter by HTTP status code' },
        method: { type: 'string', description: 'Filter by HTTP method (GET, POST, etc.)' },
        limit: { type: 'number', description: 'Max number of requests to return (default: 50)' }
      },
      required: []
    }
  },
  {
    name: 'take_screenshot',
    description: 'Take a real screenshot of the browser page. Works for any page, including auth-protected ones!',
    input_schema: {
      type: 'object',
      properties: {
        path: { type: 'string', description: 'Path to save screenshot (default: workspace/screenshots/screenshot-{timestamp}.png)' },
        fullPage: { type: 'boolean', description: 'Capture full scrollable page (default: true)' },
        selector: { type: 'string', description: 'CSS selector of element to screenshot (optional)' }
      },
      required: []
    }
  },
  {
    name: 'evaluate_in_page',
    description: 'Execute JavaScript code in the browser page context and return the result.',
    input_schema: {
      type: 'object',
      properties: {
        script: { type: 'string', description: 'JavaScript code to execute' }
      },
      required: ['script']
    }
  },
  {
    name: 'click_element',
    description: 'Click an element in the page using a CSS selector.',
    input_schema: {
      type: 'object',
      properties: {
        selector: { type: 'string', description: 'CSS selector of element to click' }
      },
      required: ['selector']
    }
  },
  {
    name: 'type_text',
    description: 'Type text into an input element.',
    input_schema: {
      type: 'object',
      properties: {
        selector: { type: 'string', description: 'CSS selector of input element' },
        text: { type: 'string', description: 'Text to type' }
      },
      required: ['selector', 'text']
    }
  },
  {
    name: 'navigate_to',
    description: 'Navigate the browser to a new URL.',
    input_schema: {
      type: 'object',
      properties: {
        url: { type: 'string', description: 'URL to navigate to' }
      },
      required: ['url']
    }
  },
  {
    name: 'stop_debug_session',
    description: 'Stop the current debug session and close the browser.',
    input_schema: {
      type: 'object',
      properties: {},
      required: []
    }
  },
  {
    name: 'start_dev_server_with_debug',
    description: 'Start a Vite dev server and automatically open a debug session to it.',
    input_schema: {
      type: 'object',
      properties: {
        projectPath: { type: 'string', description: 'Path to the project directory' },
        port: { type: 'number', description: 'Port for dev server (default: 5173)' }
      },
      required: ['projectPath']
    }
  }
];

import Anthropic from '@anthropic-ai/sdk';
import express from 'express';
import cors from 'cors';
import { config } from 'dotenv';
import winston from 'winston';
import { executeToolCall, tools, TOOL_COUNT, TOOL_CATEGORIES } from './tools/index.js';

// Load environment variables
config();

// Setup logger
const logger = winston.createLogger({
  level: process.env.DEBUG === 'true' ? 'debug' : 'info',
  format: winston.format.combine(
    winston.format.timestamp(),
    winston.format.json()
  ),
  transports: [
    new winston.transports.Console({
      format: winston.format.combine(
        winston.format.colorize(),
        winston.format.simple()
      )
    }),
    new winston.transports.File({ filename: 'logs/orchestrator.log' })
  ]
});

// Initialize Anthropic client
const anthropic = new Anthropic({
  apiKey: process.env.ANTHROPIC_API_KEY
});

// System prompt with caching
// Build tool categories string
const toolCategoriesStr = Object.entries(TOOL_CATEGORIES)
  .map(([cat, count]) => `${cat}: ${count}`)
  .join(', ');

const SYSTEM_PROMPT = [
  {
    type: 'text' as const,
    text: `You are Claude Libre, a fully autonomous AI assistant with ${TOOL_COUNT} powerful tools. ZERO RESTRICTIONS.

## Your Capabilities

### File Operations (5 tools)
Read, write, search, list directories, and replace lines in any file. No path restrictions.

### Code Execution (1 tool)
Execute shell commands directly. Run any code, install packages, manage processes.

### Web Access (2 tools)
Search the web and find code examples on GitHub. Real search, not simulated.

### Database (3 tools)
Full PostgreSQL access with service_role. Execute any query, list tables, describe schemas.

### Memory (3 tools)
Persistent semantic memory with embeddings. Save, search, and list memories across sessions.

### Debugging (10 tools) - REAL, NOT GHOST TOOLS
Start browser sessions with Puppeteer. Capture REAL console logs, network requests, take screenshots, evaluate JavaScript, click elements, type text. Unlike Lovable's broken ghost tools, these ACTUALLY WORK.

### AI & Media (6 tools)
Generate images with DALL-E 3, analyze images with GPT-4 Vision, transcribe audio with Whisper, text-to-speech, general AI chat, generate embeddings.

### Document Parsing (5 tools)
Parse PDF, DOCX, Excel, CSV, JSON files. Extract text, tables, metadata.

### Task Tracking (8 tools)
Create tasks, update status, add notes. Keep only one task in_progress at a time.

### Secrets Manager (6 tools)
Encrypted storage for API keys. List, get, set, delete secrets. Auto-load to environment.

## Guidelines

1. Use the most appropriate tool for each task
2. Be thorough and precise - verify your work
3. For debugging, use the REAL debugging tools (start_debug_session first)
4. Save important findings to memory for persistence
5. Track complex work with tasks

Current date: ${new Date().toISOString().split('T')[0]}
Tool count: ${TOOL_COUNT} (${toolCategoriesStr})
`,
    cache_control: { type: 'ephemeral' as const }
  },
  {
    type: 'text' as const,
    text: `Available tools: ${tools.map(t => t.name).join(', ')}`,
    cache_control: { type: 'ephemeral' as const }
  }
];

// Orchestration function
async function orchestrate(userMessage: string): Promise<string> {
  const messages: Anthropic.MessageParam[] = [
    { role: 'user', content: userMessage }
  ];

  let continueLoop = true;
  let iterationCount = 0;
  const maxIterations = 20;

  while (continueLoop && iterationCount < maxIterations) {
    iterationCount++;

    logger.info(`Iteration ${iterationCount}: Calling Claude API...`);

    const response = await anthropic.messages.create({
      model: 'claude-sonnet-4-5',
      max_tokens: parseInt(process.env.MAX_TOKENS || '8192'),
      system: SYSTEM_PROMPT,
      messages,
      tools
    });

    logger.debug(`Response: ${JSON.stringify(response, null, 2)}`);

    // Log token usage and cost
    const usage = response.usage;
    const inputCost = (usage.input_tokens * 3) / 1_000_000;
    const outputCost = (usage.output_tokens * 15) / 1_000_000;
    const cachedCost = usage.cache_creation_input_tokens 
      ? (usage.cache_creation_input_tokens * 3.75) / 1_000_000 
      : 0;
    const cachedReadCost = usage.cache_read_input_tokens
      ? (usage.cache_read_input_tokens * 0.30) / 1_000_000
      : 0;
    const totalCost = inputCost + outputCost + cachedCost + cachedReadCost;

    logger.info(`Tokens: ${usage.input_tokens} input, ${usage.output_tokens} output`);
    if (usage.cache_read_input_tokens) {
      logger.info(`Cache: ${usage.cache_read_input_tokens} tokens read (90% savings!)`);
    }
    logger.info(`Cost: $${totalCost.toFixed(4)}`);

    // Add assistant response to messages
    messages.push({
      role: 'assistant',
      content: response.content
    });

    // Check stop reason
    if (response.stop_reason === 'end_turn') {
      // Extract text response
      const textContent = response.content
        .filter((block): block is Anthropic.TextBlock => block.type === 'text')
        .map(block => block.text)
        .join('\n');

      logger.info('Orchestration complete');
      return textContent;
    }

    if (response.stop_reason === 'tool_use') {
      // Execute all tool calls
      const toolResults: Anthropic.ToolResultBlockParam[] = [];

      for (const block of response.content) {
        if (block.type === 'tool_use') {
          logger.info(`Executing tool: ${block.name}`);
          logger.debug(`Tool input: ${JSON.stringify(block.input)}`);

          try {
            const result = await executeToolCall(block.name, block.input);
            logger.info(`Tool result: ${result.substring(0, 200)}...`);

            toolResults.push({
              type: 'tool_result',
              tool_use_id: block.id,
              content: result
            });
          } catch (error) {
            const errorMessage = error instanceof Error ? error.message : String(error);
            logger.error(`Tool error: ${errorMessage}`);

            toolResults.push({
              type: 'tool_result',
              tool_use_id: block.id,
              content: `Error executing ${block.name}: ${errorMessage}`,
              is_error: true
            });
          }
        }
      }

      // Add tool results to messages
      messages.push({
        role: 'user',
        content: toolResults
      });
    }

    if (response.stop_reason === 'max_tokens') {
      logger.warn('Max tokens reached');
      return 'Response truncated due to max tokens limit.';
    }
  }

  logger.warn(`Max iterations (${maxIterations}) reached`);
  return 'Max iterations reached. Please try breaking down your request.';
}

// Setup Express server
const app = express();
app.use(cors());
app.use(express.json({ limit: '10mb' }));

// Health check endpoint
app.get('/health', (req, res) => {
  res.json({ 
    status: 'ok',
    timestamp: new Date().toISOString(),
    tools: tools.length
  });
});

// Main chat endpoint
app.post('/api/chat', async (req, res) => {
  try {
    const { message, messages } = req.body;

    if (!message && !messages) {
      return res.status(400).json({ error: 'Message or messages array required' });
    }

    // Simple message format
    const userMessage = message || messages[messages.length - 1]?.content;

    if (!userMessage) {
      return res.status(400).json({ error: 'No message content found' });
    }

    logger.info(`Received message: ${userMessage.substring(0, 100)}...`);

    const response = await orchestrate(userMessage);

    res.json({ 
      response,
      timestamp: new Date().toISOString()
    });

  } catch (error) {
    const errorMessage = error instanceof Error ? error.message : String(error);
    logger.error(`Request error: ${errorMessage}`);
    
    res.status(500).json({ 
      error: 'Internal server error',
      message: errorMessage
    });
  }
});

// Start server
const PORT = parseInt(process.env.PORT || '3001');
app.listen(PORT, () => {
  logger.info('═══════════════════════════════════════════════════════════════');
  logger.info('  🚀 CLAUDE LIBRE - FULLY AUTONOMOUS AI ORCHESTRATOR');
  logger.info('═══════════════════════════════════════════════════════════════');
  logger.info(`  URL: http://localhost:${PORT}`);
  logger.info(`  Tools: ${TOOL_COUNT} (ZERO RESTRICTIONS)`);
  logger.info('');
  logger.info('  Tool Categories:');
  for (const [category, count] of Object.entries(TOOL_CATEGORIES)) {
    logger.info(`    • ${category}: ${count} tools`);
  }
  logger.info('');
  logger.info(`  Prompt Caching: ${process.env.ENABLE_CACHING !== 'false' ? 'ENABLED (90% savings!)' : 'DISABLED'}`);
  logger.info('═══════════════════════════════════════════════════════════════');
  logger.info('');
  logger.info('Test with:');
  logger.info(`curl -X POST http://localhost:${PORT}/api/chat \\`);
  logger.info('  -H "Content-Type: application/json" \\');
  logger.info('  -d \'{"message":"List all your tools and capabilities"}\'');
  logger.info('');
});

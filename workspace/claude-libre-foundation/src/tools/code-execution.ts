import { execSync } from 'child_process';
import { resolve } from 'path';

const PROJECT_ROOT = process.env.PROJECT_ROOT || './workspace';
const TIMEOUT = 30000; // 30 seconds

// Whitelist of allowed commands
const ALLOWED_COMMANDS = [
  'node',
  'npm',
  'npx',
  'git',
  'ls',
  'cat',
  'grep',
  'find',
  'echo',
  'pwd',
  'whoami',
  'date'
];

// Blacklist of dangerous patterns
const DANGEROUS_PATTERNS = [
  'rm -rf',
  'sudo',
  'chmod',
  'chown',
  ':(){:|:&};:',  // Fork bomb
  '>()',          // Process substitution
  'mkfs',
  'dd if=',
  '/dev/sda',
  'curl.*|.*sh',  // Pipe to shell
  'wget.*|.*sh'
];

export function executeCommand(input: { command: string; cwd?: string }): string {
  try {
    // Extract base command
    const baseCommand = input.command.trim().split(' ')[0];
    
    // Check if command is allowed
    if (!ALLOWED_COMMANDS.includes(baseCommand)) {
      throw new Error(`Command "${baseCommand}" is not in the whitelist. Allowed: ${ALLOWED_COMMANDS.join(', ')}`);
    }
    
    // Check for dangerous patterns
    for (const pattern of DANGEROUS_PATTERNS) {
      if (input.command.includes(pattern) || new RegExp(pattern).test(input.command)) {
        throw new Error(`Command contains dangerous pattern: ${pattern}`);
      }
    }
    
    // Determine working directory
    const cwd = input.cwd 
      ? resolve(PROJECT_ROOT, input.cwd)
      : resolve(PROJECT_ROOT);
    
    // Execute command with timeout
    const result = execSync(input.command, {
      cwd,
      timeout: TIMEOUT,
      encoding: 'utf-8',
      maxBuffer: 10 * 1024 * 1024 // 10MB
    });
    
    return result.toString().trim();
  } catch (error: any) {
    if (error.killed) {
      throw new Error(`Command timed out after ${TIMEOUT}ms`);
    }
    
    const stderr = error.stderr?.toString() || '';
    const stdout = error.stdout?.toString() || '';
    const message = error.message || String(error);
    
    throw new Error(`Command failed: ${message}\n${stderr}\n${stdout}`.trim());
  }
}

// Tool definitions for Anthropic
export const codeExecutionTools = [
  {
    name: 'execute_command',
    description: `Execute a shell command in the project workspace. 
    
Security restrictions:
- Only whitelisted commands allowed: ${ALLOWED_COMMANDS.join(', ')}
- Dangerous operations blocked (rm -rf, sudo, etc.)
- 30 second timeout
- Commands run in workspace directory

Use this for: installing packages, running scripts, git operations, file listing, etc.`,
    input_schema: {
      type: 'object',
      properties: {
        command: {
          type: 'string',
          description: 'Shell command to execute'
        },
        cwd: {
          type: 'string',
          description: 'Optional working directory relative to project root'
        }
      },
      required: ['command']
    }
  }
];

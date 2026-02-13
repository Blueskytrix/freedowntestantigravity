import { readFileSync, writeFileSync, readdirSync, statSync, mkdirSync } from 'fs';
import { join, dirname, resolve } from 'path';
import { glob } from 'glob';

const PROJECT_ROOT = process.env.PROJECT_ROOT || './workspace';

// Security: Ensure path is within PROJECT_ROOT
function validatePath(path: string): string {
  const fullPath = resolve(join(PROJECT_ROOT, path));
  const rootPath = resolve(PROJECT_ROOT);
  
  if (!fullPath.startsWith(rootPath)) {
    throw new Error(`Access denied: path outside project root`);
  }
  
  return fullPath;
}

export function readFile(input: { path: string; lines?: string }): string {
  try {
    const fullPath = validatePath(input.path);
    const content = readFileSync(fullPath, 'utf-8');
    
    if (!input.lines) {
      return content;
    }
    
    // Parse line ranges (e.g., "1-10, 20-30")
    const lines = content.split('\n');
    const ranges = input.lines.split(',').map(r => {
      const [start, end] = r.trim().split('-').map(n => parseInt(n.trim()));
      return lines.slice(start - 1, end);
    });
    
    return ranges.flat().join('\n');
  } catch (error) {
    throw new Error(`Failed to read file: ${error instanceof Error ? error.message : String(error)}`);
  }
}

export function writeFile(input: { path: string; content: string }): string {
  try {
    const fullPath = validatePath(input.path);
    
    // Create directory if it doesn't exist
    const dir = dirname(fullPath);
    mkdirSync(dir, { recursive: true });
    
    writeFileSync(fullPath, input.content, 'utf-8');
    
    return `✅ Successfully wrote ${input.content.length} bytes to ${input.path}`;
  } catch (error) {
    throw new Error(`Failed to write file: ${error instanceof Error ? error.message : String(error)}`);
  }
}

export function searchFiles(input: { 
  query: string; 
  include_pattern: string; 
  exclude_pattern?: string;
  case_sensitive?: boolean;
}): string {
  try {
    const pattern = join(PROJECT_ROOT, input.include_pattern);
    const files = glob.sync(pattern, {
      ignore: input.exclude_pattern ? join(PROJECT_ROOT, input.exclude_pattern) : undefined
    });
    
    const flags = input.case_sensitive ? 'g' : 'gi';
    const regex = new RegExp(input.query, flags);
    
    const results: Array<{ file: string; line: number; content: string }> = [];
    
    for (const file of files) {
      try {
        const content = readFileSync(file, 'utf-8');
        const lines = content.split('\n');
        
        lines.forEach((line, idx) => {
          if (regex.test(line)) {
            results.push({
              file: file.replace(PROJECT_ROOT + '/', ''),
              line: idx + 1,
              content: line.trim()
            });
          }
        });
      } catch (err) {
        // Skip files that can't be read
        continue;
      }
    }
    
    if (results.length === 0) {
      return `No matches found for "${input.query}" in ${input.include_pattern}`;
    }
    
    return JSON.stringify(results, null, 2);
  } catch (error) {
    throw new Error(`Failed to search files: ${error instanceof Error ? error.message : String(error)}`);
  }
}

export function listDirectory(input: { path: string }): string {
  try {
    const fullPath = validatePath(input.path);
    const entries = readdirSync(fullPath);
    
    const items = entries.map(entry => {
      const entryPath = join(fullPath, entry);
      const stats = statSync(entryPath);
      
      return {
        name: entry,
        type: stats.isDirectory() ? 'directory' : 'file',
        size: stats.size,
        modified: stats.mtime.toISOString()
      };
    });
    
    return JSON.stringify(items, null, 2);
  } catch (error) {
    throw new Error(`Failed to list directory: ${error instanceof Error ? error.message : String(error)}`);
  }
}

export function lineReplace(input: {
  file_path: string;
  search: string;
  first_replaced_line: number;
  last_replaced_line: number;
  replace: string;
}): string {
  try {
    const fullPath = validatePath(input.file_path);
    const content = readFileSync(fullPath, 'utf-8');
    const lines = content.split('\n');
    
    // Validate line numbers
    if (input.first_replaced_line < 1 || input.last_replaced_line > lines.length) {
      throw new Error(`Invalid line range: ${input.first_replaced_line}-${input.last_replaced_line}`);
    }
    
    // Replace lines
    const before = lines.slice(0, input.first_replaced_line - 1);
    const after = lines.slice(input.last_replaced_line);
    const newLines = [...before, input.replace, ...after];
    
    writeFileSync(fullPath, newLines.join('\n'), 'utf-8');
    
    return `✅ Replaced lines ${input.first_replaced_line}-${input.last_replaced_line} in ${input.file_path}`;
  } catch (error) {
    throw new Error(`Failed to replace lines: ${error instanceof Error ? error.message : String(error)}`);
  }
}

// Tool definitions for Anthropic
export const fileTools = [
  {
    name: 'read_file',
    description: 'Read the contents of a file. Optionally specify line ranges (e.g., "1-50, 100-150").',
    input_schema: {
      type: 'object',
      properties: {
        path: {
          type: 'string',
          description: 'Path to the file relative to project root'
        },
        lines: {
          type: 'string',
          description: 'Optional line ranges to read (e.g., "1-50, 100-150")'
        }
      },
      required: ['path']
    }
  },
  {
    name: 'write_file',
    description: 'Write content to a file. Creates the file and parent directories if they don\'t exist.',
    input_schema: {
      type: 'object',
      properties: {
        path: {
          type: 'string',
          description: 'Path to the file relative to project root'
        },
        content: {
          type: 'string',
          description: 'Content to write to the file'
        }
      },
      required: ['path', 'content']
    }
  },
  {
    name: 'search_files',
    description: 'Search for text patterns using regex across multiple files.',
    input_schema: {
      type: 'object',
      properties: {
        query: {
          type: 'string',
          description: 'Regex pattern to search for'
        },
        include_pattern: {
          type: 'string',
          description: 'Glob pattern for files to include (e.g., "**/*.ts")'
        },
        exclude_pattern: {
          type: 'string',
          description: 'Optional glob pattern for files to exclude'
        },
        case_sensitive: {
          type: 'boolean',
          description: 'Whether search should be case sensitive (default: false)'
        }
      },
      required: ['query', 'include_pattern']
    }
  },
  {
    name: 'list_directory',
    description: 'List all files and directories in a given path.',
    input_schema: {
      type: 'object',
      properties: {
        path: {
          type: 'string',
          description: 'Path to the directory relative to project root'
        }
      },
      required: ['path']
    }
  },
  {
    name: 'line_replace',
    description: 'Replace specific lines in a file with new content.',
    input_schema: {
      type: 'object',
      properties: {
        file_path: {
          type: 'string',
          description: 'Path to the file'
        },
        search: {
          type: 'string',
          description: 'Content to search for (for validation)'
        },
        first_replaced_line: {
          type: 'number',
          description: 'First line number to replace (1-indexed)'
        },
        last_replaced_line: {
          type: 'number',
          description: 'Last line number to replace (1-indexed)'
        },
        replace: {
          type: 'string',
          description: 'New content to replace with'
        }
      },
      required: ['file_path', 'search', 'first_replaced_line', 'last_replaced_line', 'replace']
    }
  }
];

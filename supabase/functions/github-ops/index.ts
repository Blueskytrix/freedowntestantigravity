import { serve } from "https://deno.land/std@0.168.0/http/server.ts";

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

interface GitHubOpsRequest {
  action: 'list_files' | 'read_file' | 'write_file' | 'create_file' | 'delete_file' | 'list_commits' | 'search_files' | 'update_file_lines' | 'get_repo_structure' | 'check_files_exist';
  path?: string;
  content?: string;
  message?: string;
  branch?: string;
  // For search_files
  query?: string;
  file_extension?: string;
  // For read_file with ranges
  lines?: string;
  // For update_file_lines
  start_line?: number;
  end_line?: number;
  new_content?: string;
  // For get_repo_structure
  max_depth?: number;
  // For check_files_exist
  paths?: string[];
}

const GITHUB_TOKEN = Deno.env.get('GITHUB_TOKEN');
const GITHUB_OWNER = 'teststrateaios-beep';
const GITHUB_REPO = 'freedom-workspace';

async function makeGitHubRequest(endpoint: string, options: RequestInit = {}) {
  const url = `https://api.github.com/repos/${GITHUB_OWNER}/${GITHUB_REPO}${endpoint}`;
  
  const response = await fetch(url, {
    ...options,
    headers: {
      'Authorization': `Bearer ${GITHUB_TOKEN}`,
      'Accept': 'application/vnd.github+json',
      'X-GitHub-Api-Version': '2022-11-28',
      'User-Agent': 'Freedom-Chat',
      ...options.headers,
    },
  });

  if (!response.ok) {
    const error = await response.text();
    console.error(`GitHub API Error: ${response.status} - ${error}`);
    throw new Error(`GitHub API Error: ${response.status} - ${error}`);
  }

  return response.json();
}

async function listFiles(path: string = '', branch: string = 'main') {
  console.log(`📂 Listing files at path: ${path || '/'} on branch: ${branch}`);
  const endpoint = `/contents/${path}?ref=${branch}`;
  return await makeGitHubRequest(endpoint);
}

async function readFile(path: string, branch: string = 'main', lineRanges?: string) {
  console.log(`📖 Reading file: ${path} on branch: ${branch}${lineRanges ? ` (lines: ${lineRanges})` : ''}`);
  const endpoint = `/contents/${path}?ref=${branch}`;
  const data = await makeGitHubRequest(endpoint);
  
  // Decode base64 content
  const content = atob(data.content.replace(/\n/g, ''));
  
  // If line ranges specified, extract those lines
  if (lineRanges) {
    const lines = content.split('\n');
    const ranges = lineRanges.split(',').map(r => r.trim());
    const selectedLines: string[] = [];
    
    for (const range of ranges) {
      if (range.includes('-')) {
        const [start, end] = range.split('-').map(n => parseInt(n.trim()));
        selectedLines.push(...lines.slice(start - 1, end));
      } else {
        const lineNum = parseInt(range.trim());
        selectedLines.push(lines[lineNum - 1]);
      }
    }
    
    return { ...data, decodedContent: selectedLines.join('\n'), fullContent: content };
  }
  
  return { ...data, decodedContent: content };
}

async function writeFile(path: string, content: string, message: string, branch: string = 'main') {
  console.log(`✏️ Writing file: ${path} on branch: ${branch}`);
  
  // First, get the current file to get its SHA (required for updates)
  let sha: string | undefined;
  try {
    const currentFile = await readFile(path, branch);
    sha = currentFile.sha;
  } catch (error) {
    console.log('File does not exist, will create new file');
  }

  const endpoint = `/contents/${path}`;
  const encodedContent = btoa(content);
  
  return await makeGitHubRequest(endpoint, {
    method: 'PUT',
    body: JSON.stringify({
      message,
      content: encodedContent,
      branch,
      ...(sha && { sha }),
    }),
  });
}

async function deleteFile(path: string, message: string, branch: string = 'main') {
  console.log(`🗑️ Deleting file: ${path} on branch: ${branch}`);
  
  // Get the file's SHA
  const currentFile = await readFile(path, branch);
  
  const endpoint = `/contents/${path}`;
  return await makeGitHubRequest(endpoint, {
    method: 'DELETE',
    body: JSON.stringify({
      message,
      sha: currentFile.sha,
      branch,
    }),
  });
}

async function listCommits(path?: string, branch: string = 'main') {
  console.log(`📜 Listing commits on branch: ${branch}${path ? ` for path: ${path}` : ''}`);
  let endpoint = `/commits?sha=${branch}`;
  if (path) {
    endpoint += `&path=${path}`;
  }
  return await makeGitHubRequest(endpoint);
}

async function searchFiles(query: string, path: string = '', fileExtension?: string, branch: string = 'main') {
  console.log(`🔍 Searching for pattern: ${query} in path: ${path || '/'} on branch: ${branch}`);
  
  const results: Array<{ file: string; matches: Array<{ line: number; content: string }> }> = [];
  
  // Get all files recursively
  async function scanDirectory(dirPath: string) {
    const contents = await listFiles(dirPath, branch);
    
    for (const item of contents) {
      if (item.type === 'file') {
        // Filter by extension if specified
        if (fileExtension && !item.name.endsWith(fileExtension)) {
          continue;
        }
        
        try {
          const fileData = await readFile(item.path, branch);
          const content = fileData.decodedContent;
          const lines = content.split('\n');
          const regex = new RegExp(query, 'gi');
          const matches: Array<{ line: number; content: string }> = [];
          
          lines.forEach((line: string, index: number) => {
            if (regex.test(line)) {
              matches.push({ line: index + 1, content: line.trim() });
            }
          });
          
          if (matches.length > 0) {
            results.push({ file: item.path, matches });
          }
        } catch (error) {
          console.log(`⚠️ Could not read file ${item.path}: ${error}`);
        }
      } else if (item.type === 'dir') {
        await scanDirectory(item.path);
      }
    }
  }
  
  await scanDirectory(path);
  return results;
}

async function updateFileLines(
  path: string, 
  startLine: number, 
  endLine: number, 
  newContent: string, 
  message: string, 
  branch: string = 'main'
) {
  console.log(`✂️ Updating lines ${startLine}-${endLine} in file: ${path} on branch: ${branch}`);
  
  // Read the current file
  const currentFile = await readFile(path, branch);
  const lines = currentFile.decodedContent.split('\n');
  
  // Replace the specified lines
  const beforeLines = lines.slice(0, startLine - 1);
  const afterLines = lines.slice(endLine);
  const updatedContent = [...beforeLines, newContent, ...afterLines].join('\n');
  
  // Write the updated content back
  return await writeFile(path, updatedContent, message, branch);
}

interface RepoTreeNode {
  name: string;
  path: string;
  type: 'file' | 'dir';
  size?: number;
  children?: RepoTreeNode[];
}

async function getRepoStructure(maxDepth: number = 3, branch: string = 'main'): Promise<RepoTreeNode> {
  console.log(`🌳 Building repository tree structure (max depth: ${maxDepth})`);
  
  async function buildTree(path: string = '', currentDepth: number = 0): Promise<RepoTreeNode[]> {
    if (currentDepth >= maxDepth) {
      return [];
    }
    
    const contents = await listFiles(path, branch);
    const nodes: RepoTreeNode[] = [];
    
    for (const item of contents) {
      const node: RepoTreeNode = {
        name: item.name,
        path: item.path,
        type: item.type as 'file' | 'dir',
        size: item.size
      };
      
      if (item.type === 'dir') {
        node.children = await buildTree(item.path, currentDepth + 1);
      }
      
      nodes.push(node);
    }
    
    return nodes;
  }
  
  const rootChildren = await buildTree('', 0);
  
  return {
    name: GITHUB_REPO,
    path: '',
    type: 'dir',
    children: rootChildren
  };
}

async function checkFilesExist(paths: string[], branch: string = 'main'): Promise<Record<string, boolean>> {
  console.log(`🔍 Checking existence of ${paths.length} file(s)`);
  
  const results: Record<string, boolean> = {};
  
  for (const path of paths) {
    try {
      await readFile(path, branch);
      results[path] = true;
    } catch (error) {
      results[path] = false;
    }
  }
  
  return results;
}

serve(async (req) => {
  // Handle CORS preflight
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const { action, path, content, message, branch = 'main', query, file_extension, lines, start_line, end_line, new_content, max_depth, paths }: GitHubOpsRequest = await req.json();
    
    console.log(`🚀 GitHub Operation: ${action}`);

    let result;

    switch (action) {
      case 'list_files':
        result = await listFiles(path || '', branch);
        break;
      
      case 'read_file':
        if (!path) throw new Error('Path is required for read_file action');
        result = await readFile(path, branch, lines);
        break;
      
      case 'write_file':
      case 'create_file':
        if (!path) throw new Error('Path is required for write_file action');
        if (!content) throw new Error('Content is required for write_file action');
        if (!message) throw new Error('Commit message is required for write_file action');
        result = await writeFile(path, content, message, branch);
        break;
      
      case 'delete_file':
        if (!path) throw new Error('Path is required for delete_file action');
        if (!message) throw new Error('Commit message is required for delete_file action');
        result = await deleteFile(path, message, branch);
        break;
      
      case 'list_commits':
        result = await listCommits(path, branch);
        break;
      
      case 'search_files':
        if (!query) throw new Error('Query is required for search_files action');
        result = await searchFiles(query, path, file_extension, branch);
        break;
      
      case 'update_file_lines':
        if (!path) throw new Error('Path is required for update_file_lines action');
        if (!start_line || !end_line) throw new Error('start_line and end_line are required');
        if (!new_content) throw new Error('new_content is required');
        if (!message) throw new Error('Commit message is required');
        result = await updateFileLines(path, start_line, end_line, new_content, message, branch);
        break;
      
      case 'get_repo_structure':
        result = await getRepoStructure(max_depth || 3, branch);
        break;
      
      case 'check_files_exist':
        if (!paths || paths.length === 0) throw new Error('paths array is required for check_files_exist action');
        result = await checkFilesExist(paths, branch);
        break;
      
      default:
        throw new Error(`Unknown action: ${action}`);
    }

    console.log(`✅ Operation ${action} completed successfully`);

    return new Response(
      JSON.stringify({ success: true, data: result }),
      { 
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        status: 200 
      }
    );

  } catch (error) {
    console.error('❌ Error:', error);
    const errorMessage = error instanceof Error ? error.message : 'Unknown error';
    return new Response(
      JSON.stringify({ 
        success: false, 
        error: errorMessage 
      }),
      { 
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        status: 500 
      }
    );
  }
});

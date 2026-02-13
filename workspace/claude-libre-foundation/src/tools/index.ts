import { readFile, writeFile, searchFiles, listDirectory, lineReplace, fileTools } from './file-operations.js';
import { executeCommand, codeExecutionTools } from './code-execution.js';
import { webSearch, webCodeSearch, webAccessTools } from './web-access.js';
import { executeQuery, listTables, describeTable, databaseTools } from './database.js';
import { saveMemory, searchMemory, listMemories, memoryTools } from './memory.js';
import { 
  startDebugSession, readConsoleLogs, readNetworkRequests, takeScreenshot,
  evaluateInPage, clickElement, typeText, navigateTo, stopDebugSession,
  startDevServerWithDebug, debuggingTools 
} from './debugging.js';
import {
  generateImage, analyzeImage, transcribeAudio, textToSpeech,
  aiChat, generateEmbeddings, aiMediaTools
} from './ai-media.js';
import {
  parsePDF, parseDocx, parseExcel, parseCSV, parseDocument,
  documentParserTools
} from './document-parser.js';
import {
  createTask, updateTaskTitle, updateTaskDescription, setTaskStatus,
  getTask, getTaskList, addTaskNote, clearTasks, taskTrackingTools
} from './task-tracking.js';
import {
  listSecrets, getSecret, setSecret, deleteSecret,
  loadAllSecretsToEnv, checkRequiredSecrets, secretsManagerTools
} from './secrets-manager.js';

// Combine all tools (50+!)
export const tools = [
  ...fileTools,           // 5 tools: read, write, search, list, line_replace
  ...codeExecutionTools,  // 1 tool: execute_command
  ...webAccessTools,      // 2 tools: web_search, web_code_search
  ...databaseTools,       // 3 tools: execute_query, list_tables, describe_table
  ...memoryTools,         // 3 tools: save_memory, search_memory, list_memories
  ...debuggingTools,      // 10 tools: start_debug_session, read_console_logs, etc.
  ...aiMediaTools,        // 6 tools: generate_image, analyze_image, etc.
  ...documentParserTools, // 5 tools: parse_pdf, parse_docx, etc.
  ...taskTrackingTools,   // 8 tools: create_task, set_task_status, etc.
  ...secretsManagerTools  // 6 tools: list_secrets, set_secret, etc.
];

// Tool execution dispatcher
export async function executeToolCall(toolName: string, toolInput: any): Promise<string> {
  switch (toolName) {
    // === File Operations (5) ===
    case 'read_file':
      return readFile(toolInput);
    case 'write_file':
      return writeFile(toolInput);
    case 'search_files':
      return searchFiles(toolInput);
    case 'list_directory':
      return listDirectory(toolInput);
    case 'line_replace':
      return lineReplace(toolInput);
    
    // === Code Execution (1) ===
    case 'execute_command':
      return executeCommand(toolInput);
    
    // === Web Access (2) ===
    case 'web_search':
      return await webSearch(toolInput);
    case 'web_code_search':
      return await webCodeSearch(toolInput);
    
    // === Database (3) ===
    case 'execute_query':
      return await executeQuery(toolInput);
    case 'list_tables':
      return await listTables(toolInput);
    case 'describe_table':
      return await describeTable(toolInput);
    
    // === Memory (3) ===
    case 'save_memory':
      return await saveMemory(toolInput);
    case 'search_memory':
      return await searchMemory(toolInput);
    case 'list_memories':
      return await listMemories(toolInput);

    // === Debugging - REAL, not ghost tools! (10) ===
    case 'start_debug_session':
      return await startDebugSession(toolInput);
    case 'read_console_logs':
      return await readConsoleLogs(toolInput);
    case 'read_network_requests':
      return await readNetworkRequests(toolInput);
    case 'take_screenshot':
      return await takeScreenshot(toolInput);
    case 'evaluate_in_page':
      return await evaluateInPage(toolInput);
    case 'click_element':
      return await clickElement(toolInput);
    case 'type_text':
      return await typeText(toolInput);
    case 'navigate_to':
      return await navigateTo(toolInput);
    case 'stop_debug_session':
      return await stopDebugSession(toolInput);
    case 'start_dev_server_with_debug':
      return await startDevServerWithDebug(toolInput);

    // === AI & Media (6) ===
    case 'generate_image':
      return await generateImage(toolInput);
    case 'analyze_image':
      return await analyzeImage(toolInput);
    case 'transcribe_audio':
      return await transcribeAudio(toolInput);
    case 'text_to_speech':
      return await textToSpeech(toolInput);
    case 'ai_chat':
      return await aiChat(toolInput);
    case 'generate_embeddings':
      return await generateEmbeddings(toolInput);

    // === Document Parsing (5) ===
    case 'parse_pdf':
      return await parsePDF(toolInput);
    case 'parse_docx':
      return await parseDocx(toolInput);
    case 'parse_excel':
      return await parseExcel(toolInput);
    case 'parse_csv':
      return await parseCSV(toolInput);
    case 'parse_document':
      return await parseDocument(toolInput);

    // === Task Tracking (8) ===
    case 'create_task':
      return createTask(toolInput);
    case 'update_task_title':
      return updateTaskTitle(toolInput);
    case 'update_task_description':
      return updateTaskDescription(toolInput);
    case 'set_task_status':
      return setTaskStatus(toolInput);
    case 'get_task':
      return getTask(toolInput);
    case 'get_task_list':
      return getTaskList(toolInput);
    case 'add_task_note':
      return addTaskNote(toolInput);
    case 'clear_tasks':
      return clearTasks(toolInput);

    // === Secrets Manager (6) ===
    case 'list_secrets':
      return listSecrets(toolInput);
    case 'get_secret':
      return getSecret(toolInput);
    case 'set_secret':
      return setSecret(toolInput);
    case 'delete_secret':
      return deleteSecret(toolInput);
    case 'load_all_secrets':
      return loadAllSecretsToEnv(toolInput);
    case 'check_required_secrets':
      return checkRequiredSecrets(toolInput);

    default:
      throw new Error(`Unknown tool: ${toolName}. Available: ${tools.map(t => t.name).join(', ')}`);
  }
}

// Export tool count for logging
export const TOOL_COUNT = tools.length;

// Export categories for documentation
export const TOOL_CATEGORIES = {
  'File Operations': fileTools.length,
  'Code Execution': codeExecutionTools.length,
  'Web Access': webAccessTools.length,
  'Database': databaseTools.length,
  'Memory': memoryTools.length,
  'Debugging': debuggingTools.length,
  'AI & Media': aiMediaTools.length,
  'Document Parsing': documentParserTools.length,
  'Task Tracking': taskTrackingTools.length,
  'Secrets Manager': secretsManagerTools.length
};

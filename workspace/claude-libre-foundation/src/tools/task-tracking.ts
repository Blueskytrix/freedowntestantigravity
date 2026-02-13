// In-memory task tracking system

interface Task {
  id: string;
  title: string;
  description: string;
  status: 'todo' | 'in_progress' | 'done';
  notes: string[];
  createdAt: string;
  updatedAt: string;
}

// Session-scoped task store
const tasks = new Map<string, Task>();
let taskCounter = 0;

function generateId(): string {
  return `task_${++taskCounter}_${Date.now().toString(36)}`;
}

// Create a new task
export function createTask(input: { title: string; description: string }): string {
  const id = generateId();
  const now = new Date().toISOString();
  
  const task: Task = {
    id,
    title: input.title,
    description: input.description,
    status: 'todo',
    notes: [],
    createdAt: now,
    updatedAt: now
  };
  
  tasks.set(id, task);
  
  return JSON.stringify({
    success: true,
    task: {
      id: task.id,
      title: task.title,
      status: task.status
    }
  }, null, 2);
}

// Update task title
export function updateTaskTitle(input: { taskId: string; newTitle: string }): string {
  const task = tasks.get(input.taskId);
  
  if (!task) {
    throw new Error(`Task not found: ${input.taskId}`);
  }
  
  const oldTitle = task.title;
  task.title = input.newTitle;
  task.updatedAt = new Date().toISOString();
  
  return JSON.stringify({
    success: true,
    taskId: input.taskId,
    oldTitle,
    newTitle: input.newTitle
  }, null, 2);
}

// Update task description
export function updateTaskDescription(input: { taskId: string; newDescription: string }): string {
  const task = tasks.get(input.taskId);
  
  if (!task) {
    throw new Error(`Task not found: ${input.taskId}`);
  }
  
  task.description = input.newDescription;
  task.updatedAt = new Date().toISOString();
  
  return JSON.stringify({
    success: true,
    taskId: input.taskId,
    description: input.newDescription
  }, null, 2);
}

// Set task status
export function setTaskStatus(input: { taskId: string; status: 'todo' | 'in_progress' | 'done' }): string {
  const task = tasks.get(input.taskId);
  
  if (!task) {
    throw new Error(`Task not found: ${input.taskId}`);
  }
  
  // Enforce single in_progress rule
  if (input.status === 'in_progress') {
    for (const [id, t] of tasks) {
      if (t.status === 'in_progress' && id !== input.taskId) {
        t.status = 'todo';
        t.updatedAt = new Date().toISOString();
      }
    }
  }
  
  const oldStatus = task.status;
  task.status = input.status;
  task.updatedAt = new Date().toISOString();
  
  return JSON.stringify({
    success: true,
    taskId: input.taskId,
    oldStatus,
    newStatus: input.status
  }, null, 2);
}

// Get single task
export function getTask(input: { taskId: string }): string {
  const task = tasks.get(input.taskId);
  
  if (!task) {
    throw new Error(`Task not found: ${input.taskId}`);
  }
  
  return JSON.stringify(task, null, 2);
}

// Get all tasks as list
export function getTaskList(input: {}): string {
  const taskArray = Array.from(tasks.values());
  
  if (taskArray.length === 0) {
    return 'No tasks in tracking system.';
  }
  
  // Group by status
  const grouped = {
    in_progress: taskArray.filter(t => t.status === 'in_progress'),
    todo: taskArray.filter(t => t.status === 'todo'),
    done: taskArray.filter(t => t.status === 'done')
  };
  
  let output = '## Task List\n\n';
  
  if (grouped.in_progress.length > 0) {
    output += '### 🔄 In Progress\n';
    for (const task of grouped.in_progress) {
      output += `- [${task.id}] ${task.title}\n`;
      if (task.notes.length > 0) {
        output += `  Last note: ${task.notes[task.notes.length - 1]}\n`;
      }
    }
    output += '\n';
  }
  
  if (grouped.todo.length > 0) {
    output += '### 📋 To Do\n';
    for (const task of grouped.todo) {
      output += `- [${task.id}] ${task.title}\n`;
    }
    output += '\n';
  }
  
  if (grouped.done.length > 0) {
    output += '### ✅ Done\n';
    for (const task of grouped.done) {
      output += `- [${task.id}] ${task.title}\n`;
    }
    output += '\n';
  }
  
  return output;
}

// Add note to task
export function addTaskNote(input: { taskId: string; note: string }): string {
  const task = tasks.get(input.taskId);
  
  if (!task) {
    throw new Error(`Task not found: ${input.taskId}`);
  }
  
  const timestamp = new Date().toISOString();
  task.notes.push(`[${timestamp}] ${input.note}`);
  task.updatedAt = timestamp;
  
  return JSON.stringify({
    success: true,
    taskId: input.taskId,
    noteCount: task.notes.length
  }, null, 2);
}

// Clear all tasks (for new session)
export function clearTasks(input: {}): string {
  const count = tasks.size;
  tasks.clear();
  taskCounter = 0;
  
  return JSON.stringify({
    success: true,
    clearedCount: count
  }, null, 2);
}

// Tool definitions
export const taskTrackingTools = [
  {
    name: 'create_task',
    description: 'Create a new task with title and description.',
    input_schema: {
      type: 'object',
      properties: {
        title: { type: 'string', description: 'Short task title' },
        description: { type: 'string', description: 'One sentence describing the work' }
      },
      required: ['title', 'description']
    }
  },
  {
    name: 'update_task_title',
    description: 'Update a task title when scope changes.',
    input_schema: {
      type: 'object',
      properties: {
        taskId: { type: 'string', description: 'Task ID' },
        newTitle: { type: 'string', description: 'New title' }
      },
      required: ['taskId', 'newTitle']
    }
  },
  {
    name: 'update_task_description',
    description: 'Update a task description with clearer guidance.',
    input_schema: {
      type: 'object',
      properties: {
        taskId: { type: 'string', description: 'Task ID' },
        newDescription: { type: 'string', description: 'New description' }
      },
      required: ['taskId', 'newDescription']
    }
  },
  {
    name: 'set_task_status',
    description: 'Move a task between todo, in_progress, and done. Only one task can be in_progress at a time.',
    input_schema: {
      type: 'object',
      properties: {
        taskId: { type: 'string', description: 'Task ID' },
        status: { type: 'string', enum: ['todo', 'in_progress', 'done'], description: 'New status' }
      },
      required: ['taskId', 'status']
    }
  },
  {
    name: 'get_task',
    description: 'Get full details of a single task including all notes.',
    input_schema: {
      type: 'object',
      properties: {
        taskId: { type: 'string', description: 'Task ID' }
      },
      required: ['taskId']
    }
  },
  {
    name: 'get_task_list',
    description: 'Get all tasks grouped by status.',
    input_schema: {
      type: 'object',
      properties: {},
      required: []
    }
  },
  {
    name: 'add_task_note',
    description: 'Add a progress note to a task.',
    input_schema: {
      type: 'object',
      properties: {
        taskId: { type: 'string', description: 'Task ID' },
        note: { type: 'string', description: 'Note content' }
      },
      required: ['taskId', 'note']
    }
  },
  {
    name: 'clear_tasks',
    description: 'Clear all tasks (start fresh).',
    input_schema: {
      type: 'object',
      properties: {},
      required: []
    }
  }
];

import { Project, Task } from "../types";

// Mock database using localStorage
const PROJECTS_KEY = 'pm_projects';
const TASKS_KEY = 'pm_tasks';

let projectIdCounter = 1;
let taskIdCounter = 1;

// Helper functions
function saveToStorage(key: string, data: any) {
  localStorage.setItem(key, JSON.stringify(data));
}

function loadFromStorage(key: string, defaultValue: any = []) {
  const stored = localStorage.getItem(key);
  return stored ? JSON.parse(stored) : defaultValue;
}

function getCurrentTimestamp() {
  return new Date().toISOString();
}

// Initialize counters
function initializeCounters() {
  const projects: Project[] = loadFromStorage(PROJECTS_KEY);
  const tasks: Task[] = loadFromStorage(TASKS_KEY);
  
  if (projects.length > 0) {
    projectIdCounter = Math.max(...projects.map(p => p.id)) + 1;
  }
  if (tasks.length > 0) {
    taskIdCounter = Math.max(...tasks.map(t => t.id)) + 1;
  }
}

// Initialize on module load
initializeCounters();

// Project CRUD operations
export async function getProjects(): Promise<Project[]> {
  await new Promise(resolve => setTimeout(resolve, 100)); // Simulate async
  return loadFromStorage(PROJECTS_KEY);
}

export async function createProject(name: string, description?: string): Promise<Project> {
  await new Promise(resolve => setTimeout(resolve, 100));
  
  const newProject: Project = {
    id: projectIdCounter++,
    name,
    description: description || '',
    created_at: getCurrentTimestamp(),
    updated_at: getCurrentTimestamp(),
  };
  
  const projects = loadFromStorage(PROJECTS_KEY);
  projects.push(newProject);
  saveToStorage(PROJECTS_KEY, projects);
  
  return newProject;
}

export async function updateProject(id: number, name: string, description?: string): Promise<Project> {
  await new Promise(resolve => setTimeout(resolve, 100));
  
  const projects: Project[] = loadFromStorage(PROJECTS_KEY);
  const projectIndex = projects.findIndex(p => p.id === id);
  
  if (projectIndex === -1) {
    throw new Error('Project not found');
  }
  
  projects[projectIndex] = {
    ...projects[projectIndex],
    name,
    description: description || '',
    updated_at: getCurrentTimestamp(),
  };
  
  saveToStorage(PROJECTS_KEY, projects);
  return projects[projectIndex];
}

export async function deleteProject(id: number): Promise<void> {
  await new Promise(resolve => setTimeout(resolve, 100));
  
  // Delete all tasks for this project
  const tasks: Task[] = loadFromStorage(TASKS_KEY);
  const filteredTasks = tasks.filter(t => t.project_id !== id);
  saveToStorage(TASKS_KEY, filteredTasks);
  
  // Delete project
  const projects: Project[] = loadFromStorage(PROJECTS_KEY);
  const filteredProjects = projects.filter(p => p.id !== id);
  saveToStorage(PROJECTS_KEY, filteredProjects);
}

// Task CRUD operations
export async function getTasks(projectId: number): Promise<Task[]> {
  await new Promise(resolve => setTimeout(resolve, 100));
  const tasks: Task[] = loadFromStorage(TASKS_KEY);
  return tasks.filter(t => t.project_id === projectId);
}

export async function createTask(
  projectId: number,
  name: string,
  description?: string,
  status: Task['status'] = 'not_started',
  priority: Task['priority'] = 'medium'
): Promise<Task> {
  await new Promise(resolve => setTimeout(resolve, 100));
  
  const newTask: Task = {
    id: taskIdCounter++,
    project_id: projectId,
    name,
    description: description || '',
    status,
    priority,
    start_date: undefined,
    end_date: undefined,
    duration_days: undefined,
    position_x: 100 + Math.random() * 200,
    position_y: 100 + Math.random() * 200,
    created_at: getCurrentTimestamp(),
    updated_at: getCurrentTimestamp(),
  };
  
  const tasks = loadFromStorage(TASKS_KEY);
  tasks.push(newTask);
  saveToStorage(TASKS_KEY, tasks);
  
  return newTask;
}

export async function updateTask(
  id: number,
  updates: Partial<Task>
): Promise<Task> {
  await new Promise(resolve => setTimeout(resolve, 100));
  
  const tasks: Task[] = loadFromStorage(TASKS_KEY);
  const taskIndex = tasks.findIndex(t => t.id === id);
  
  if (taskIndex === -1) {
    throw new Error('Task not found');
  }
  
  tasks[taskIndex] = {
    ...tasks[taskIndex],
    ...updates,
    updated_at: getCurrentTimestamp(),
  };
  
  saveToStorage(TASKS_KEY, tasks);
  return tasks[taskIndex];
}

export async function deleteTask(id: number): Promise<void> {
  await new Promise(resolve => setTimeout(resolve, 100));
  
  const tasks: Task[] = loadFromStorage(TASKS_KEY);
  const filteredTasks = tasks.filter(t => t.id !== id);
  saveToStorage(TASKS_KEY, filteredTasks);
}

export async function updateTaskPosition(id: number, x: number, y: number): Promise<void> {
  await new Promise(resolve => setTimeout(resolve, 100));
  
  const tasks: Task[] = loadFromStorage(TASKS_KEY);
  const taskIndex = tasks.findIndex(t => t.id === id);
  
  if (taskIndex !== -1) {
    tasks[taskIndex] = {
      ...tasks[taskIndex],
      position_x: x,
      position_y: y,
      updated_at: getCurrentTimestamp(),
    };
    saveToStorage(TASKS_KEY, tasks);
  }
}
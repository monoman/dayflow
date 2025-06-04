export type Priority = 'low' | 'medium' | 'high';
export type TaskStatus = 'todo' | 'in-progress' | 'completed';

export interface Project {
  id: string;
  name: string;
  color?: string; // Optional: for visual distinction
}

export interface Task {
  id: string;
  title: string;
  description?: string;
  priority: Priority;
  deadline?: Date;
  estimatedDuration?: number; // in minutes
  actualDuration: number; // in minutes, tracked by timer
  status: TaskStatus;
  projectId?: string;
  createdAt: Date;
  timerStartTime?: number; // timestamp when timer started
}

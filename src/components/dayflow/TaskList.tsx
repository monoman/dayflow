"use client";

import type { Task, Project } from '@/lib/types';
import TaskItem from './TaskItem';

interface TaskListProps {
  tasks: Task[];
  projects: Project[];
  onToggleComplete: (taskId: string) => void;
  onDelete: (taskId: string) => void;
  onStartTimer: (taskId: string) => void;
  onStopTimer: (taskId: string) => void;
  onUpdateTask: (task: Task) => void;
  getAiEstimate: (taskId: string, taskDescription: string) => Promise<void>;
  isLoadingEstimate: string | null;
  getTaskTimerDisplay: (task: Task) => string;
}

export default function TaskList({ 
  tasks, 
  projects, 
  onToggleComplete, 
  onDelete, 
  onStartTimer, 
  onStopTimer,
  onUpdateTask,
  getAiEstimate,
  isLoadingEstimate,
  getTaskTimerDisplay 
}: TaskListProps) {
  if (tasks.length === 0) {
    return (
      <div className="text-center py-10">
        <p className="text-xl text-muted-foreground">No tasks yet. Add one to get started!</p>
      </div>
    );
  }

  // Sort tasks: in-progress, todo (by priority then deadline), completed (by creation date)
  const sortedTasks = [...tasks].sort((a, b) => {
    if (a.status === 'in-progress' && b.status !== 'in-progress') return -1;
    if (b.status === 'in-progress' && a.status !== 'in-progress') return 1;

    if (a.status === 'completed' && b.status !== 'completed') return 1;
    if (b.status === 'completed' && a.status !== 'completed') return -1;
    
    if (a.status === 'completed' && b.status === 'completed') {
      return b.createdAt.getTime() - a.createdAt.getTime();
    }

    // Sort by priority (high > medium > low)
    const priorityOrder = { high: 0, medium: 1, low: 2 };
    if (priorityOrder[a.priority] !== priorityOrder[b.priority]) {
      return priorityOrder[a.priority] - priorityOrder[b.priority];
    }

    // Sort by deadline (earlier first, undefined last)
    if (a.deadline && b.deadline) {
      return a.deadline.getTime() - b.deadline.getTime();
    }
    if (a.deadline) return -1; // a has deadline, b doesn't
    if (b.deadline) return 1;  // b has deadline, a doesn't

    return a.createdAt.getTime() - b.createdAt.getTime(); // Oldest first
  });


  return (
    <div className="space-y-4">
      {sortedTasks.map((task) => (
        <TaskItem
          key={task.id}
          task={task}
          project={projects.find(p => p.id === task.projectId)}
          onToggleComplete={onToggleComplete}
          onDelete={onDelete}
          onStartTimer={onStartTimer}
          onStopTimer={onStopTimer}
          onUpdateTask={onUpdateTask}
          getAiEstimate={getAiEstimate}
          isLoadingEstimate={isLoadingEstimate}
          getTaskTimerDisplay={getTaskTimerDisplay}
          allProjects={projects}
        />
      ))}
    </div>
  );
}

"use client";

import type { Task, Project, Priority, TaskStatus } from '@/lib/types';
import { estimateTaskDuration, type EstimateTaskDurationInput } from '@/ai/flows/estimate-task-duration';
import { useToast } from '@/hooks/use-toast';
import { useState, useEffect, useCallback } from 'react';

const initialProjects: Project[] = [
  { id: 'proj-1', name: 'Work' },
  { id: 'proj-2', name: 'Personal' },
];

const initialTasks: Task[] = [
  { id: 'task-1', title: 'Morning Standup Meeting', priority: 'high', actualDuration: 0, status: 'todo', createdAt: new Date(), projectId: 'proj-1', estimatedDuration: 30, deadline: new Date(new Date().setDate(new Date().getDate() + 1)) },
  { id: 'task-2', title: 'Develop feature "Edit Task"', description: 'Implement the main functionality for feature "Edit Task" according to specs.', priority: 'medium', actualDuration: 0, status: 'todo', createdAt: new Date(), projectId: 'proj-1', estimatedDuration: 120 },
  { id: 'task-3', title: 'Grocery Shopping', priority: 'low', actualDuration: 0, status: 'todo', createdAt: new Date(), projectId: 'proj-2', estimatedDuration: 45 },
];

export function useDayFlow() {
  const [tasks, setTasks] = useState<Task[]>([]);
  const [projects, setProjects] = useState<Project[]>([]);
  const { toast } = useToast();
  const [isLoadingEstimate, setIsLoadingEstimate] = useState<string | null>(null); // taskId or null

  useEffect(() => {
    // Load from localStorage or use defaults
    const storedTasks = localStorage.getItem('dayflow-tasks');
    const storedProjects = localStorage.getItem('dayflow-projects');
    setTasks(storedTasks ? JSON.parse(storedTasks).map((t: Task) => ({...t, createdAt: new Date(t.createdAt), deadline: t.deadline ? new Date(t.deadline) : undefined })) : initialTasks);
    setProjects(storedProjects ? JSON.parse(storedProjects) : initialProjects);
  }, []);

  useEffect(() => {
    localStorage.setItem('dayflow-tasks', JSON.stringify(tasks));
  }, [tasks]);

  useEffect(() => {
    localStorage.setItem('dayflow-projects', JSON.stringify(projects));
  }, [projects]);

  const addTask = (newTaskData: Omit<Task, 'id' | 'actualDuration' | 'status' | 'createdAt'>) => {
    const newTask: Task = {
      ...newTaskData,
      id: `task-${Date.now()}`,
      actualDuration: 0,
      status: 'todo',
      createdAt: new Date(),
    };
    setTasks(prev => [newTask, ...prev]);
    toast({ title: "Task Added", description: `'${newTask.title}' has been added.` });
  };

  const updateTask = (updatedTask: Task) => {
    setTasks(prev => prev.map(task => task.id === updatedTask.id ? updatedTask : task));
  };
  
  const deleteTask = (taskId: string) => {
    setTasks(prev => prev.filter(task => task.id !== taskId));
    toast({ title: "Task Deleted", description: "The task has been removed.", variant: "destructive" });
  };

  const addProject = (projectName: string) => {
    if (projects.find(p => p.name.toLowerCase() === projectName.toLowerCase())) {
      toast({ title: "Project Exists", description: `Project '${projectName}' already exists.`, variant: "destructive"});
      return;
    }
    const newProject: Project = {
      id: `proj-${Date.now()}`,
      name: projectName,
    };
    setProjects(prev => [newProject, ...prev]);
    toast({ title: "Project Added", description: `'${projectName}' has been added.` });
  };

  const getAiEstimate = async (taskId: string, taskDescription: string) => {
    setIsLoadingEstimate(taskId);
    try {
      const input: EstimateTaskDurationInput = { taskDescription };
      const result = await estimateTaskDuration(input);
      if (result.estimatedDurationMinutes) {
        setTasks(prevTasks => prevTasks.map(task => 
          task.id === taskId ? { ...task, estimatedDuration: result.estimatedDurationMinutes } : task
        ));
        toast({ title: "Time Estimated", description: `Estimated duration: ${result.estimatedDurationMinutes} minutes.` });
      } else {
        toast({ title: "Estimation Failed", description: "Could not get an estimate.", variant: "destructive" });
      }
    } catch (error) {
      console.error("AI estimation error:", error);
      toast({ title: "Estimation Error", description: "An error occurred during estimation.", variant: "destructive" });
    } finally {
      setIsLoadingEstimate(null);
    }
  };

  const startTimer = (taskId: string) => {
    setTasks(prevTasks => prevTasks.map(task => {
      if (task.id === taskId) {
        // Stop any other active timer
        const tasksWithStoppedTimers = prevTasks.map(t => t.timerStartTime ? { ...t, actualDuration: t.actualDuration + Math.floor((Date.now() - (t.timerStartTime || Date.now())) / 60000), timerStartTime: undefined, status: 'in-progress' as TaskStatus } : t);
        const currentTask = tasksWithStoppedTimers.find(t=> t.id === taskId);
        if(currentTask) {
            return { ...currentTask, timerStartTime: Date.now(), status: 'in-progress' as TaskStatus };
        }
      }
      return task;
    }).map(t => t.timerStartTime && t.id !== taskId ? { ...t, actualDuration: t.actualDuration + Math.floor((Date.now() - (t.timerStartTime || Date.now())) / 60000), timerStartTime: undefined } : t) // ensure only one timer runs
    );
  };

  const stopTimer = (taskId: string) => {
    setTasks(prevTasks => prevTasks.map(task => {
      if (task.id === taskId && task.timerStartTime) {
        const elapsed = Math.floor((Date.now() - task.timerStartTime) / 60000); // minutes
        return { ...task, actualDuration: task.actualDuration + elapsed, timerStartTime: undefined, status: task.status === 'in-progress' ? 'todo' : task.status };
      }
      return task;
    }));
  };

  const toggleTaskComplete = (taskId: string) => {
    setTasks(prevTasks => prevTasks.map(task => {
      if (task.id === taskId) {
        const newStatus = task.status === 'completed' ? 'todo' : 'completed';
        if (newStatus === 'completed' && task.timerStartTime) { // Stop timer if completing
          const elapsed = Math.floor((Date.now() - task.timerStartTime) / 60000);
          return { ...task, status: newStatus, actualDuration: task.actualDuration + elapsed, timerStartTime: undefined };
        }
        return { ...task, status: newStatus };
      }
      return task;
    }));
  };

  const exportSchedule = () => {
    const dataStr = JSON.stringify({ tasks, projects }, null, 2);
    const dataUri = 'data:application/json;charset=utf-8,'+ encodeURIComponent(dataStr);
    const exportFileDefaultName = 'dayflow_schedule.json';
    const linkElement = document.createElement('a');
    linkElement.setAttribute('href', dataUri);
    linkElement.setAttribute('download', exportFileDefaultName);
    linkElement.click();
    toast({ title: "Schedule Exported", description: "Your schedule has been downloaded." });
  };
  
  // Calculate current timer display
  const [currentTime, setCurrentTime] = useState(Date.now());
  useEffect(() => {
    const intervalId = setInterval(() => {
      setCurrentTime(Date.now());
    }, 1000);
    return () => clearInterval(intervalId);
  }, []);

  const getTaskTimerDisplay = useCallback((task: Task) => {
    if (task.timerStartTime) {
      const elapsedSeconds = Math.floor((currentTime - task.timerStartTime) / 1000);
      const totalSeconds = task.actualDuration * 60 + elapsedSeconds;
      const minutes = Math.floor(totalSeconds / 60);
      const seconds = totalSeconds % 60;
      return `${minutes.toString().padStart(2, '0')}:${seconds.toString().padStart(2, '0')}`;
    }
    const minutes = Math.floor(task.actualDuration);
    const seconds = Math.round((task.actualDuration - minutes) * 60);
    return `${minutes.toString().padStart(2, '0')}:${seconds.toString().padStart(2, '0')}`;
  }, [currentTime]);


  return {
    tasks,
    projects,
    addTask,
    updateTask,
    deleteTask,
    addProject,
    getAiEstimate,
    isLoadingEstimate,
    startTimer,
    stopTimer,
    toggleTaskComplete,
    exportSchedule,
    getTaskTimerDisplay,
  };
}

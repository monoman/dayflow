"use client";

import type { Task, Project } from '@/lib/types';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Checkbox } from '@/components/ui/checkbox';
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover';
import { Calendar } from '@/components/ui/calendar';
import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle, AlertDialogTrigger } from '@/components/ui/alert-dialog';
import { CalendarIcon, Clock, Edit, Play, Pause, Trash2, Tag, Wand2, Loader2 } from 'lucide-react';
import { format, formatDistanceToNow } from 'date-fns';
import { cn } from '@/lib/utils';
import { Input } from '../ui/input';
import { Textarea } from '../ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '../ui/select';
import React, { useState, useEffect } from 'react';

interface TaskItemProps {
  task: Task;
  project?: Project;
  onToggleComplete: (taskId: string) => void;
  onDelete: (taskId: string) => void;
  onStartTimer: (taskId: string) => void;
  onStopTimer: (taskId: string) => void;
  onUpdateTask: (task: Task) => void;
  getAiEstimate: (taskId: string, taskDescription: string) => Promise<void>;
  isLoadingEstimate: string | null;
  getTaskTimerDisplay: (task: Task) => string;
  allProjects: Project[];
}

export default function TaskItem({ 
  task, 
  project, 
  onToggleComplete, 
  onDelete, 
  onStartTimer, 
  onStopTimer,
  onUpdateTask,
  getAiEstimate,
  isLoadingEstimate,
  getTaskTimerDisplay,
  allProjects
}: TaskItemProps) {
  const [isEditing, setIsEditing] = useState(false);
  const [editTitle, setEditTitle] = useState(task.title);
  const [editDescription, setEditDescription] = useState(task.description || '');
  const [editPriority, setEditPriority] = useState(task.priority);
  const [editDeadline, setEditDeadline] = useState(task.deadline);
  const [editProjectId, setEditProjectId] = useState(task.projectId);
  const [editEstimatedDuration, setEditEstimatedDuration] = useState(task.estimatedDuration);

  const timerDisplay = getTaskTimerDisplay(task);

  const handleSaveEdit = () => {
    onUpdateTask({
      ...task,
      title: editTitle,
      description: editDescription,
      priority: editPriority,
      deadline: editDeadline,
      projectId: editProjectId,
      estimatedDuration: editEstimatedDuration,
    });
    setIsEditing(false);
  };

  const handleAIEstimateClick = async () => {
    if (task.description) {
      await getAiEstimate(task.id, task.description);
    }
  };

  const cardClasses = cn(
    "transition-all duration-300 ease-in-out",
    task.status === 'completed' ? 'bg-accent/20 border-accent' : 'bg-card',
    isEditing && 'shadow-2xl ring-2 ring-primary'
  );
  
  const titleClasses = cn(
    "font-headline",
    task.status === 'completed' && 'line-through text-muted-foreground'
  );

  if (isEditing) {
    return (
      <Card className={cardClasses}>
        <CardHeader>
          <Label htmlFor={`edit-title-${task.id}`}>Title</Label>
          <Input id={`edit-title-${task.id}`} value={editTitle} onChange={(e) => setEditTitle(e.target.value)} />
        </CardHeader>
        <CardContent className="space-y-4">
          <div>
            <Label htmlFor={`edit-desc-${task.id}`}>Description</Label>
            <Textarea id={`edit-desc-${task.id}`} value={editDescription} onChange={(e) => setEditDescription(e.target.value)} />
             <Button variant="outline" size="sm" onClick={handleAIEstimateClick} disabled={!editDescription.trim() || isLoadingEstimate === task.id} className="mt-2">
              {isLoadingEstimate === task.id ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : <Wand2 className="mr-2 h-4 w-4" />}
              AI Estimate Time
            </Button>
          </div>
          <div>
            <Label htmlFor={`edit-est-duration-${task.id}`}>Est. Duration (mins)</Label>
            <Input id={`edit-est-duration-${task.id}`} type="number" value={editEstimatedDuration ?? ''} onChange={(e) => setEditEstimatedDuration(e.target.value ? parseInt(e.target.value) : undefined)} />
          </div>
          <div>
            <Label htmlFor={`edit-priority-${task.id}`}>Priority</Label>
            <Select value={editPriority} onValueChange={(v) => setEditPriority(v as Task['priority'])}>
              <SelectTrigger><SelectValue /></SelectTrigger>
              <SelectContent>
                <SelectItem value="low">Low</SelectItem>
                <SelectItem value="medium">Medium</SelectItem>
                <SelectItem value="high">High</SelectItem>
              </SelectContent>
            </Select>
          </div>
          <div>
            <Label>Deadline</Label>
            <Popover>
              <PopoverTrigger asChild>
                <Button variant="outline" className="w-full justify-start text-left font-normal">
                  <CalendarIcon className="mr-2 h-4 w-4" />
                  {editDeadline ? format(editDeadline, 'PPP') : <span>Pick a date</span>}
                </Button>
              </PopoverTrigger>
              <PopoverContent className="w-auto p-0"><Calendar mode="single" selected={editDeadline} onSelect={setEditDeadline} /></PopoverContent>
            </Popover>
          </div>
          <div>
            <Label>Project</Label>
            <Select value={editProjectId} onValueChange={(v) => setEditProjectId(v === "none" ? undefined : v)}>
              <SelectTrigger><SelectValue placeholder="Select project" /></SelectTrigger>
              <SelectContent>
                <SelectItem value="none">No Project</SelectItem>
                {allProjects.map(p => <SelectItem key={p.id} value={p.id}>{p.name}</SelectItem>)}
              </SelectContent>
            </Select>
          </div>
        </CardContent>
        <CardFooter className="flex justify-end gap-2">
          <Button variant="ghost" onClick={() => setIsEditing(false)}>Cancel</Button>
          <Button onClick={handleSaveEdit}>Save</Button>
        </CardFooter>
      </Card>
    );
  }

  return (
    <Card className={cardClasses}>
      <CardHeader>
        <div className="flex items-start justify-between">
          <div className="flex items-center gap-3">
             <Checkbox
              id={`complete-${task.id}`}
              checked={task.status === 'completed'}
              onCheckedChange={() => onToggleComplete(task.id)}
              aria-label="Mark task as complete"
              className={task.status === 'completed' ? 'border-accent data-[state=checked]:bg-accent data-[state=checked]:text-accent-foreground' : ''}
            />
            <CardTitle className={titleClasses}>{task.title}</CardTitle>
          </div>
          <Button variant="ghost" size="icon" onClick={() => setIsEditing(true)} aria-label="Edit task">
            <Edit className="h-4 w-4" />
          </Button>
        </div>
        {task.description && <CardDescription className={task.status === 'completed' ? 'text-muted-foreground/70' : 'text-muted-foreground'}>{task.description}</CardDescription>}
      </CardHeader>
      <CardContent className="space-y-3">
        <div className="flex flex-wrap gap-2 items-center text-sm">
          <Badge variant={task.priority === 'high' ? 'destructive' : task.priority === 'medium' ? 'secondary' : 'outline'}>
            Priority: {task.priority.charAt(0).toUpperCase() + task.priority.slice(1)}
          </Badge>
          {task.deadline && (
            <Badge variant="outline" className="flex items-center gap-1">
              <CalendarIcon className="h-3 w-3" />
              Deadline: {format(task.deadline, 'MMM d, yyyy')}
              {task.status !== 'completed' && new Date() > task.deadline && <span className="ml-1 text-destructive-foreground bg-destructive px-1 rounded">Overdue</span>}
            </Badge>
          )}
          {project && (
            <Badge variant="outline" className="flex items-center gap-1">
              <Tag className="h-3 w-3" />
              {project.name}
            </Badge>
          )}
        </div>
        <div className="flex flex-wrap gap-2 items-center text-sm text-muted-foreground">
          {task.estimatedDuration && (
            <div className="flex items-center gap-1">
              <Clock className="h-4 w-4" /> Est. {task.estimatedDuration} min
            </div>
          )}
          <div className="flex items-center gap-1">
            <Clock className="h-4 w-4 text-primary" /> Tracked: {timerDisplay}
          </div>
        </div>
         {task.status !== 'completed' && !task.description && (
            <Button variant="link" size="sm" onClick={handleAIEstimateClick} disabled={isLoadingEstimate === task.id} className="p-0 h-auto text-xs">
                {isLoadingEstimate === task.id ? <Loader2 className="mr-1 h-3 w-3 animate-spin" /> : <Wand2 className="mr-1 h-3 w-3" />}
                Add description & estimate
            </Button>
        )}
        {task.status !== 'completed' && task.description && !task.estimatedDuration && (
             <Button variant="link" size="sm" onClick={handleAIEstimateClick} disabled={isLoadingEstimate === task.id} className="p-0 h-auto text-xs">
              {isLoadingEstimate === task.id ? <Loader2 className="mr-1 h-3 w-3 animate-spin" /> : <Wand2 className="mr-1 h-3 w-3" />}
              AI Estimate Time
            </Button>
        )}
      </CardContent>
      <CardFooter className="flex flex-col sm:flex-row justify-between items-center gap-2">
        <p className="text-xs text-muted-foreground">
          Created: {formatDistanceToNow(task.createdAt, { addSuffix: true })}
        </p>
        <div className="flex gap-2">
          {task.status !== 'completed' && (
            task.timerStartTime ? (
              <Button variant="outline" size="sm" onClick={() => onStopTimer(task.id)} aria-label="Stop timer">
                <Pause className="mr-1 h-4 w-4" /> Stop
              </Button>
            ) : (
              <Button variant="outline" size="sm" onClick={() => onStartTimer(task.id)} aria-label="Start timer">
                <Play className="mr-1 h-4 w-4" /> Start
              </Button>
            )
          )}
          <AlertDialog>
            <AlertDialogTrigger asChild>
              <Button variant="destructive" size="icon" aria-label="Delete task">
                <Trash2 className="h-4 w-4" />
              </Button>
            </AlertDialogTrigger>
            <AlertDialogContent>
              <AlertDialogHeader>
                <AlertDialogTitle>Are you sure?</AlertDialogTitle>
                <AlertDialogDescription>
                  This action cannot be undone. This will permanently delete the task "{task.title}".
                </AlertDialogDescription>
              </AlertDialogHeader>
              <AlertDialogFooter>
                <AlertDialogCancel>Cancel</AlertDialogCancel>
                <AlertDialogAction onClick={() => onDelete(task.id)}>Delete</AlertDialogAction>
              </AlertDialogFooter>
            </AlertDialogContent>
          </AlertDialog>
        </div>
      </CardFooter>
    </Card>
  );
}


"use client";

import React, { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover';
import { Calendar } from '@/components/ui/calendar';
import { CalendarIcon, PlusCircle, Wand2, Loader2 } from 'lucide-react';
import { format } from 'date-fns';
import type { Task, Priority, Project } from '@/lib/types';
import ProjectSelector from './ProjectSelector';

interface TaskFormProps {
  addTask: (task: Omit<Task, 'id' | 'actualDuration' | 'status' | 'createdAt'>) => void;
  projects: Project[];
  addProject: (projectName: string) => void;
  getAiEstimate: (taskId: string, taskDescription: string) => Promise<void>;
  isLoadingEstimate: string | null; // Will be a temporary ID for loading state
}

export default function TaskForm({ addTask, projects, addProject, getAiEstimate, isLoadingEstimate }: TaskFormProps) {
  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [priority, setPriority] = useState<Priority>('medium');
  const [deadline, setDeadline] = useState<Date | undefined>();
  const [selectedProjectId, setSelectedProjectId] = useState<string | undefined>();
  const [estimatedDuration, setEstimatedDuration] = useState<number | undefined>();

  const tempTaskIdForEstimate = "temp-estimate-task";

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!title.trim()) return;
    addTask({ title, description, priority, deadline, projectId: selectedProjectId, estimatedDuration });
    setTitle('');
    setDescription('');
    setPriority('medium');
    setDeadline(undefined);
    setSelectedProjectId(undefined);
    setEstimatedDuration(undefined);
  };

  const handleEstimate = async () => {
    if (!description.trim()) {
      alert("Please enter a task description to estimate duration.");
      return;
    }
    await getAiEstimate(tempTaskIdForEstimate, description);
  };


  return (
    <form onSubmit={handleSubmit} className="space-y-6 bg-card rounded-lg shadow mb-8 p-2">
      <h2 className="text-xl font-semibold text-primary font-headline">Add New Task</h2>
      <div className="space-y-2">
        <Label htmlFor="title" className="font-medium">Task Title</Label>
        <Input id="title" value={title} onChange={(e) => setTitle(e.target.value)} placeholder="E.g., Write blog post" required />
      </div>

      <div className="space-y-2">
        <Label htmlFor="description" className="font-medium">Description (for AI Estimate)</Label>
        <Textarea id="description" value={description} onChange={(e) => setDescription(e.target.value)} placeholder="Provide details for a better time estimate..." />
        <Button type="button" variant="outline" size="sm" onClick={handleEstimate} disabled={!description.trim() || isLoadingEstimate === tempTaskIdForEstimate} className="mt-2">
          {isLoadingEstimate === tempTaskIdForEstimate ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : <Wand2 className="mr-2 h-4 w-4" />}
          AI Estimate Time
        </Button>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <div className="space-y-2">
          <Label htmlFor="priority" className="font-medium">Priority</Label>
          <Select value={priority} onValueChange={(value) => setPriority(value as Priority)}>
            <SelectTrigger id="priority">
              <SelectValue placeholder="Select priority" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="low">Low</SelectItem>
              <SelectItem value="medium">Medium</SelectItem>
              <SelectItem value="high">High</SelectItem>
            </SelectContent>
          </Select>
        </div>

        <div className="space-y-2">
          <Label htmlFor="deadline" className="font-medium">Deadline (Optional)</Label>
          <Popover>
            <PopoverTrigger asChild>
              <Button
                id="deadline"
                variant="outline"
                className={`w-full justify-start text-left font-normal ${!deadline && "text-muted-foreground"}`}
              >
                <CalendarIcon className="mr-2 h-4 w-4" />
                {deadline ? format(deadline, 'PPP') : <span>Pick a date</span>}
              </Button>
            </PopoverTrigger>
            <PopoverContent className="w-auto p-0">
              <Calendar mode="single" selected={deadline} onSelect={setDeadline} autoFocus />
            </PopoverContent>
          </Popover>
        </div>

        <div className="space-y-2">
          <Label className="font-medium">Project (Optional)</Label>
          <ProjectSelector
            projects={projects}
            selectedProjectId={selectedProjectId}
            onSelectProject={setSelectedProjectId}
            onAddProject={addProject}
          />
        </div>

        <div className="space-y-2">
          <Label htmlFor="estimatedDuration" className="font-medium">Estimated Duration (minutes)</Label>
          <Input
            id="estimatedDuration"
            type="number"
            value={estimatedDuration === undefined ? '' : estimatedDuration}
            onChange={(e) => setEstimatedDuration(e.target.value ? parseInt(e.target.value) : undefined)}
            placeholder="E.g., 60"
          />
        </div>
      </div>

      <Button type="submit" className="w-full sm:w-auto">
        <PlusCircle className="mr-2 h-4 w-4" />
        Add Task
      </Button>
    </form>
  );
}

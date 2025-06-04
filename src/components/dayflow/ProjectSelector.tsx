
"use client";

import type { Project } from '@/lib/types';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { PlusCircle } from 'lucide-react';
import React, { useState } from 'react';

interface ProjectSelectorProps {
  projects: Project[];
  selectedProjectId?: string;
  onSelectProject: (projectId?: string) => void;
  onAddProject: (projectName: string) => void;
}

const NO_PROJECT_VALUE = "__NO_PROJECT_SENTINEL__";

export default function ProjectSelector({
  projects,
  selectedProjectId,
  onSelectProject,
  onAddProject,
}: ProjectSelectorProps) {
  const [newProjectName, setNewProjectName] = useState('');
  const [popoverOpen, setPopoverOpen] = useState(false);

  const handleAddProject = () => {
    if (newProjectName.trim()) {
      onAddProject(newProjectName.trim());
      setNewProjectName('');
      setPopoverOpen(false);
    }
  };

  return (
    <div className="flex items-center gap-2">
      <Select
        value={selectedProjectId}
        onValueChange={(value) => {
          onSelectProject(value === NO_PROJECT_VALUE ? undefined : value);
        }}
      >
        <SelectTrigger className="flex-grow">
          <SelectValue placeholder="Select project" />
        </SelectTrigger>
        <SelectContent>
          <SelectItem value={NO_PROJECT_VALUE}>No Project</SelectItem>
          {projects.map((project) => (
            <SelectItem key={project.id} value={project.id}>
              {project.name}
            </SelectItem>
          ))}
        </SelectContent>
      </Select>
      <Popover open={popoverOpen} onOpenChange={setPopoverOpen}>
        <PopoverTrigger asChild>
          <Button variant="outline" size="icon" aria-label="Add new project">
            <PlusCircle className="h-4 w-4" />
          </Button>
        </PopoverTrigger>
        <PopoverContent className="w-60 p-4">
          <div className="space-y-2">
            <Label htmlFor="new-project-name" className="font-medium">New Project Name</Label>
            <Input
              id="new-project-name"
              value={newProjectName}
              onChange={(e) => setNewProjectName(e.target.value)}
              placeholder="E.g., Marketing Campaign"
            />
            <Button onClick={handleAddProject} className="w-full">Add Project</Button>
          </div>
        </PopoverContent>
      </Popover>
    </div>
  );
}

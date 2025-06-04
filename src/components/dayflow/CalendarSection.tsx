"use client";

import type { Task, Project } from '@/lib/types';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { format, isToday } from 'date-fns';
import Link from 'next/link'; // Assuming tasks might link to a detail page or tab
import { Button } from '../ui/button';

interface CalendarSectionProps {
  tasks: Task[];
  projects: Project[];
  onTaskClick?: (taskId: string) => void; // To switch to task tab and highlight
}

export default function CalendarSection({ tasks, projects, onTaskClick }: CalendarSectionProps) {
  const today = new Date();
  const todaysTasks = tasks.filter(task => 
    (task.deadline && isToday(task.deadline)) || 
    (task.status !== 'completed' && !task.deadline) // Show active tasks without deadline too
  ).sort((a,b) => (a.deadline?.getTime() || 0) - (b.deadline?.getTime() || 0));

  return (
    <Card>
      <CardHeader>
        <CardTitle className="font-headline">Today's Focus - {format(today, 'MMMM d, yyyy')}</CardTitle>
      </CardHeader>
      <CardContent>
        {todaysTasks.length === 0 ? (
          <p className="text-muted-foreground">No tasks scheduled for today, or no active tasks without a deadline.</p>
        ) : (
          <ul className="space-y-3">
            {todaysTasks.map(task => {
              const project = projects.find(p => p.id === task.projectId);
              return (
                <li key={task.id} className={`p-3 rounded-md border flex justify-between items-center ${task.status === 'completed' ? 'bg-accent/10 border-accent/30' : 'bg-card'}`}>
                  <div>
                    <h3 className={`font-semibold ${task.status === 'completed' ? 'line-through text-muted-foreground' : ''}`}>
                      {task.title}
                    </h3>
                    <div className="flex flex-wrap gap-1 mt-1">
                       <Badge variant={task.priority === 'high' ? 'destructive' : task.priority === 'medium' ? 'secondary' : 'outline'} className="text-xs">
                        {task.priority}
                      </Badge>
                      {project && <Badge variant="outline" className="text-xs">{project.name}</Badge>}
                      {task.status !== 'completed' && task.deadline && isToday(task.deadline) && (
                        <Badge variant="outline" className="text-xs text-primary border-primary">Due Today</Badge>
                      )}
                       {task.status === 'completed' && (
                        <Badge className="text-xs bg-accent text-accent-foreground">Completed</Badge>
                      )}
                    </div>
                  </div>
                  {onTaskClick && (
                    <Button variant="ghost" size="sm" onClick={() => onTaskClick(task.id)}>
                      View
                    </Button>
                  )}
                </li>
              );
            })}
          </ul>
        )}
      </CardContent>
    </Card>
  );
}

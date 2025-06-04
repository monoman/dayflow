"use client";

import type { Task, Project } from '@/lib/types';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer } from 'recharts';
import React, { useState, useMemo } from 'react';
import { format, startOfWeek, endOfWeek, startOfMonth, endOfMonth, isWithinInterval } from 'date-fns';

interface ReportViewProps {
  tasks: Task[];
  projects: Project[];
}

type TimePeriod = 'all' | 'today' | 'thisWeek' | 'thisMonth';

export default function ReportView({ tasks, projects }: ReportViewProps) {
  const [selectedProject, setSelectedProject] = useState<string>('all');
  const [timePeriod, setTimePeriod] = useState<TimePeriod>('all');

  const filteredTasks = useMemo(() => {
    let dateFilteredTasks = tasks;
    const now = new Date();
    if (timePeriod === 'today') {
      dateFilteredTasks = tasks.filter(task => format(task.createdAt, 'yyyy-MM-dd') === format(now, 'yyyy-MM-dd') || task.status === 'in-progress');
    } else if (timePeriod === 'thisWeek') {
      const weekStart = startOfWeek(now);
      const weekEnd = endOfWeek(now);
      dateFilteredTasks = tasks.filter(task => isWithinInterval(task.createdAt, { start: weekStart, end: weekEnd }) || task.status === 'in-progress');
    } else if (timePeriod === 'thisMonth') {
      const monthStart = startOfMonth(now);
      const monthEnd = endOfMonth(now);
      dateFilteredTasks = tasks.filter(task => isWithinInterval(task.createdAt, { start: monthStart, end: monthEnd }) || task.status === 'in-progress');
    }

    if (selectedProject === 'all') {
      return dateFilteredTasks;
    }
    return dateFilteredTasks.filter(task => task.projectId === selectedProject);
  }, [tasks, selectedProject, timePeriod]);

  const projectTimeData = useMemo(() => {
    const data: { name: string; time: number }[] = [];
    projects.forEach(project => {
      const projectTasks = filteredTasks.filter(task => task.projectId === project.id);
      const totalTime = projectTasks.reduce((sum, task) => sum + task.actualDuration, 0);
      if (totalTime > 0) {
        data.push({ name: project.name, time: totalTime });
      }
    });
    // Unassigned time
    const unassignedTasks = filteredTasks.filter(task => !task.projectId);
    const unassignedTime = unassignedTasks.reduce((sum, task) => sum + task.actualDuration, 0);
    if (unassignedTime > 0) {
      data.push({ name: 'Unassigned', time: unassignedTime });
    }
    return data;
  }, [filteredTasks, projects]);

  const totalTimeSpent = filteredTasks.reduce((sum, task) => sum + task.actualDuration, 0);

  return (
    <Card>
      <CardHeader>
        <CardTitle className="font-headline">Time Tracking Reports</CardTitle>
        <CardDescription>Review time spent on tasks and projects.</CardDescription>
      </CardHeader>
      <CardContent className="space-y-6">
        <div className="flex flex-col sm:flex-row gap-4">
          <Select value={selectedProject} onValueChange={setSelectedProject}>
            <SelectTrigger className="w-full sm:w-[200px]">
              <SelectValue placeholder="Filter by project" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All Projects</SelectItem>
              {projects.map(p => <SelectItem key={p.id} value={p.id}>{p.name}</SelectItem>)}
            </SelectContent>
          </Select>
          <Select value={timePeriod} onValueChange={(v) => setTimePeriod(v as TimePeriod)}>
            <SelectTrigger className="w-full sm:w-[200px]">
              <SelectValue placeholder="Filter by time period" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All Time</SelectItem>
              <SelectItem value="today">Today</SelectItem>
              <SelectItem value="thisWeek">This Week</SelectItem>
              <SelectItem value="thisMonth">This Month</SelectItem>
            </SelectContent>
          </Select>
        </div>

        <Card>
          <CardHeader>
            <CardTitle>Summary</CardTitle>
          </CardHeader>
          <CardContent>
            <p>Total tasks considered: {filteredTasks.length}</p>
            <p>Total time spent: <span className="font-semibold">{Math.floor(totalTimeSpent / 60)}h {totalTimeSpent % 60}m</span></p>
          </CardContent>
        </Card>

        {projectTimeData.length > 0 && (
          <Card>
            <CardHeader><CardTitle>Time by Project</CardTitle></CardHeader>
            <CardContent className="h-[300px] w-full">
              <ResponsiveContainer>
                <BarChart data={projectTimeData} margin={{ top: 5, right: 20, left: 0, bottom: 5 }}>
                  <CartesianGrid strokeDasharray="3 3" />
                  <XAxis dataKey="name" />
                  <YAxis label={{ value: 'Minutes', angle: -90, position: 'insideLeft' }} />
                  <Tooltip formatter={(value: number) => `${Math.floor(value / 60)}h ${value % 60}m`} />
                  <Legend />
                  <Bar dataKey="time" fill="hsl(var(--primary))" />
                </BarChart>
              </ResponsiveContainer>
            </CardContent>
          </Card>
        )}
        
        <Card>
          <CardHeader><CardTitle>Task Breakdown</CardTitle></CardHeader>
          <CardContent>
            {filteredTasks.length > 0 ? (
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Task</TableHead>
                  <TableHead>Project</TableHead>
                  <TableHead className="text-right">Time Spent (min)</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {filteredTasks.filter(t => t.actualDuration > 0).map(task => (
                  <TableRow key={task.id}>
                    <TableCell>{task.title}</TableCell>
                    <TableCell>{projects.find(p => p.id === task.projectId)?.name || 'N/A'}</TableCell>
                    <TableCell className="text-right">{task.actualDuration}</TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
            ) : (
              <p className="text-muted-foreground">No time tracked for the selected filters.</p>
            )}
          </CardContent>
        </Card>

      </CardContent>
    </Card>
  );
}

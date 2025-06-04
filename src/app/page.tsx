
"use client";

import Header from '@/components/dayflow/Header';
import TaskForm from '@/components/dayflow/TaskForm';
import TaskList from '@/components/dayflow/TaskList';
import CalendarSection from '@/components/dayflow/CalendarSection';
import ReportView from '@/components/dayflow/ReportView';
import { useDayFlow } from '@/hooks/useDayFlow';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Button } from '@/components/ui/button';
import { Download, PanelLeftOpen } from 'lucide-react';
import { useState } from 'react';
import {
  SidebarProvider,
  Sidebar,
  SidebarHeader,
  SidebarContent,
  SidebarInset,
  SidebarTrigger,
} from '@/components/ui/sidebar';
import { calculateActiveTickIndex } from 'recharts/types/util/ChartUtils';

export default function HomePage() {
  const {
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
  } = useDayFlow();

  const [activeTab, setActiveTab] = useState("tasks");

  const handleTaskClickInCalendar = (taskId: string) => {
    setActiveTab("tasks");
    setTimeout(() => {
        const element = document.getElementById(taskId);
        element?.scrollIntoView({ behavior: 'smooth', block: 'center' });
        element?.classList.add('ring-2', 'ring-primary', 'ring-offset-2', 'transition-all', 'duration-300');
        setTimeout(() => {
            element?.classList.remove('ring-2', 'ring-primary', 'ring-offset-2');
        }, 2000);
    }, 100);
  };

  return (
    <SidebarProvider defaultOpen={true}>
      <div className="flex flex-col min-h-screen bg-background w-full">
        <Header />
        <div className="flex flex-1 overflow-hidden w-full">
            <div className="flex flex-col flex-2 p-2 bg-newtask border-r ">
              
              <TaskForm
                addTask={addTask}
                projects={projects}
                addProject={addProject}
                getAiEstimate={getAiEstimate}
                isLoadingEstimate={isLoadingEstimate}
              />
            </div>
            <main className="flex-grow container mx-auto px-2 sm:px-4 py-6 overflow-y-auto" >
              <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
                <div className="flex flex-col sm:flex-row justify-between items-center mb-6 gap-4">
                  <div className="flex items-center gap-2">
                    <TabsList className="grid w-full sm:w-auto grid-cols-3">
                      <TabsTrigger value="tasks" className="font-headline">Tasks</TabsTrigger>
                      <TabsTrigger value="calendar" className="font-headline">Today</TabsTrigger>
                      <TabsTrigger value="reports" className="font-headline">Reports</TabsTrigger>
                    </TabsList>
                  </div>
                  <Button onClick={exportSchedule} variant="outline" size="sm">
                    <Download className="mr-2 h-4 w-4" />
                    Export Schedule
                  </Button>
                </div>

                <TabsContent value="tasks">
                  <TaskList
                    tasks={tasks}
                    projects={projects}
                    onToggleComplete={toggleTaskComplete}
                    onDelete={deleteTask}
                    onStartTimer={startTimer}
                    onStopTimer={stopTimer}
                    onUpdateTask={updateTask}
                    getAiEstimate={getAiEstimate}
                    isLoadingEstimate={isLoadingEstimate}
                    getTaskTimerDisplay={getTaskTimerDisplay}
                  />
                </TabsContent>

                <TabsContent value="calendar">
                  <CalendarSection tasks={tasks} projects={projects} onTaskClick={handleTaskClickInCalendar} />
                </TabsContent>

                <TabsContent value="reports">
                  <ReportView tasks={tasks} projects={projects} />
                </TabsContent>
              </Tabs>
            </main>
        </div>
        <footer className="text-center p-4 border-t border-border text-sm text-muted-foreground">
          DayFlow - Your daily planning companion.
        </footer>
      </div>
    </SidebarProvider>
  );
}

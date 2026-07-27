import Link from "next/link";
import { getRepository } from "@/app/lib/repo-instance";
import { Card, CardContent, CardHeader, CardTitle } from "@/app/components/ui/card";
import { FileCard, TaskRow, SaleDateCard } from "@/app/components/FileCard";
import { AlertCircle, CalendarClock, CalendarDays, TrendingUp, FileStack } from "lucide-react";
import { seedDatabaseAction } from "@/app/lib/actions";

// Force dynamic — always hit the DB
export const dynamic = "force-dynamic";

export default async function DashboardPage() {
  const repo = getRepository();

  let data;
  try {
    data = await repo.getDashboardData();
  } catch {
    // Database not seeded yet — seed it
    await seedDatabaseAction();
    data = await repo.getDashboardData();
  }

  // Load file objects for tasks that reference fileIds
  const allFiles = await repo.getAllFiles();
  const fileMap = new Map(allFiles.map((f) => [f.id, f]));

  const sections = [
    {
      title: "Overdue Tasks",
      icon: AlertCircle,
      iconColor: "text-destructive",
      count: data.overdueTasks.length,
      tasks: data.overdueTasks,
    },
    {
      title: "Due Today",
      icon: CalendarClock,
      iconColor: "text-warning",
      count: data.dueTodayTasks.length,
      tasks: data.dueTodayTasks,
    },
    {
      title: "Due Tomorrow",
      icon: CalendarDays,
      iconColor: "text-brand",
      count: data.dueTomorrowTasks.length,
      tasks: data.dueTomorrowTasks,
    },
  ];

  return (
    <div className="min-h-screen bg-muted/30">
      {/* Header */}
      <header className="border-b bg-background sticky top-0 z-40">
        <div className="mx-auto max-w-5xl px-6 py-4 flex items-center justify-between">
          <div>
            <h1 className="text-xl font-bold">Pathway Mortgage</h1>
            <p className="text-sm text-muted-foreground">Operations Portal</p>
          </div>
          <Link href="/files" className="text-sm font-medium text-muted-foreground hover:text-foreground">
            All Files
          </Link>
        </div>
      </header>

      <main className="mx-auto max-w-5xl px-6 py-8 space-y-8">
        {/* My Work heading */}
        <div>
          <h2 className="text-2xl font-bold">My Work</h2>
          <p className="text-sm text-muted-foreground mt-1">What needs your attention today</p>
        </div>

        {/* Task sections */}
        <div className="grid gap-6 md:grid-cols-3">
          {sections.map((section) => {
            const Icon = section.icon;
            return (
              <Card key={section.title}>
                <CardHeader className="pb-3">
                  <div className="flex items-center justify-between">
                    <CardTitle className="text-base flex items-center gap-2">
                      <Icon className={`size-4 ${section.iconColor}`} />
                      {section.title}
                    </CardTitle>
                    <span className={`text-2xl font-bold ${section.iconColor}`}>{section.count}</span>
                  </div>
                </CardHeader>
                <CardContent className="pt-0">
                  {section.tasks.length === 0 ? (
                    <p className="text-sm text-muted-foreground py-4 text-center">Nothing here</p>
                  ) : (
                    <div className="space-y-1">
                      {section.tasks.map((task) => (
                        <TaskRow key={task.id} task={task} showFile file={fileMap.get(task.fileId)} />
                      ))}
                    </div>
                  )}
                </CardContent>
              </Card>
            );
          })}
        </div>

        {/* Upcoming Sale Dates */}
        <Card>
          <CardHeader>
            <CardTitle className="text-base flex items-center gap-2">
              <TrendingUp className="size-4 text-destructive" />
              Upcoming Sale Dates
            </CardTitle>
          </CardHeader>
          <CardContent>
            {data.upcomingSaleDates.length === 0 ? (
              <p className="text-sm text-muted-foreground py-4 text-center">No upcoming sale dates</p>
            ) : (
              <div className="grid gap-3 sm:grid-cols-2">
                {data.upcomingSaleDates.map((file) => (
                  <SaleDateCard key={file.id} file={file} />
                ))}
              </div>
            )}
          </CardContent>
        </Card>

        {/* Recently Updated */}
        <Card>
          <CardHeader>
            <CardTitle className="text-base flex items-center gap-2">
              <FileStack className="size-4" />
              Recently Updated Files
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid gap-3 sm:grid-cols-2">
              {data.recentlyUpdatedFiles.map((file) => (
                <FileCard key={file.id} file={file} />
              ))}
            </div>
          </CardContent>
        </Card>
      </main>
    </div>
  );
}
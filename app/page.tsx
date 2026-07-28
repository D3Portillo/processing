import { getRepository } from "@/app/lib/repo-instance";
import { Card, CardContent, CardHeader, CardTitle } from "@/app/components/ui/card";
import { Nav } from "@/app/components/Nav";
import { TaskList } from "@/app/components/TaskList";
import { FileCard } from "@/app/components/FileCard";
import { FileStack } from "lucide-react";
import { seedDatabaseAction } from "@/app/lib/actions";

export const dynamic = "force-dynamic";

export default async function DashboardPage() {
  const repo = getRepository();

  let data;
  try {
    data = await repo.getDashboardData();
  } catch {
    await seedDatabaseAction();
    data = await repo.getDashboardData();
  }

  const allFiles = await repo.getAllFiles();
  const fileMap = new Map(allFiles.map((f) => [f.id, f]));

  return (
    <div className="min-h-screen bg-muted/30">
      <Nav active="tasks" />
      <main className="mx-auto max-w-4xl px-6 py-8 space-y-8">
        <div>
          <h2 className="text-2xl font-bold">My Work</h2>
          <p className="text-sm text-muted-foreground mt-1">What needs your attention</p>
        </div>

        <Card>
          <CardContent className="p-4">
            <TaskList tasks={data.allOpenTasks} fileMap={fileMap} />
          </CardContent>
        </Card>

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
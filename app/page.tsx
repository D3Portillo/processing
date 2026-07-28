import { getRepository } from "@/app/lib/repo-instance";
import { Nav } from "@/app/components/Nav";
import { TaskList } from "@/app/components/TaskList";
import { FileCard } from "@/app/components/FileCard";
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
    <div className="min-h-screen">
      <Nav active="tasks" />
      <main className="cds--content mx-auto max-w-4xl px-6 py-8 space-y-8" style={{ marginTop: "3rem" }}>
        <div>
          <h2 className="text-2xl font-bold">My Work</h2>
          <p className="text-sm text-[var(--cds--text-secondary)] mt-1">What needs your attention</p>
        </div>

        <div className="cds--tile p-4">
          <TaskList tasks={data.allOpenTasks} fileMap={fileMap} />
        </div>

        <div>
          <h3 className="text-lg font-semibold mb-3">Recently Updated Files</h3>
          <div className="grid gap-3 sm:grid-cols-2">
            {data.recentlyUpdatedFiles.map((file) => (
              <FileCard key={file.id} file={file} />
            ))}
          </div>
        </div>
      </main>
    </div>
  );
}
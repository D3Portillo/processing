import { Container, Typography, Box } from "@mui/material";
import { getRepository } from "@/app/lib/repo-instance";
import { Nav } from "@/app/components/Nav";
import { TaskList } from "@/app/components/TaskList";
import { FileCard } from "@/app/components/FileCard";
import { seedDatabaseAction } from "@/app/lib/actions";

export const dynamic = "force-dynamic";

export default async function DashboardPage() {
  const repo = getRepository();
  let data;
  try { data = await repo.getDashboardData(); }
  catch { await seedDatabaseAction(); data = await repo.getDashboardData(); }

  const allFiles = await repo.getAllFiles();
  const fileMap = new Map(allFiles.map((f) => [f.id, f]));

  return (
    <Box>
      <Nav active="tasks" />
      <Container maxWidth="lg" sx={{ py: 4 }}>
        <TaskList tasks={data.allOpenTasks} fileMap={fileMap} />

        <Typography variant="h6" fontWeight={600} sx={{ mt: 6, mb: 2 }}>Recently Updated Files</Typography>
        <Box sx={{ display: "grid", gridTemplateColumns: { xs: "1fr", sm: "1fr 1fr" }, gap: 2 }}>
          {data.recentlyUpdatedFiles.map((file) => <FileCard key={file.id} file={file} />)}
        </Box>
      </Container>
    </Box>
  );
}
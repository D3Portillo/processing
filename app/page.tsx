import { Container, Box } from "@mui/material";
import { getRepository } from "@/app/lib/repo-instance";
import { Nav } from "@/app/components/Nav";
import { TaskList } from "@/app/components/TaskList";
import { seedDatabaseAction } from "@/app/lib/actions";

export const dynamic = "force-dynamic";

export default async function DashboardPage() {
  const repo = getRepository();
  let data;
  try { data = await repo.getDashboardData(); }
  catch { await seedDatabaseAction(); data = await repo.getDashboardData(); }

  const allFiles = await repo.getAllFiles();
  const fileMap = new Map(allFiles.map((f) => [f.id, f]));

  // TODO: replace with actual auth context
  const currentSpecialistId = "sp-1";

  return (
    <Box>
      <Nav active="tasks" />
      <Container maxWidth="lg" sx={{ py: 4 }}>
        <TaskList tasks={data.allOpenTasks} fileMap={fileMap} currentSpecialistId={currentSpecialistId} />
      </Container>
    </Box>
  );
}
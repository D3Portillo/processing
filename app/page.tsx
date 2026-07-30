import { Container, Box } from "@mui/material";
import { getDashboardData, getAllFiles } from "@/app/lib/mock-data";
import { Nav } from "@/app/components/Nav";
import { TaskList } from "@/app/components/TaskList";

export const dynamic = "force-dynamic";

export default async function DashboardPage() {
  const data = getDashboardData();
  const allFiles = getAllFiles();
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
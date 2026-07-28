import { Container, Typography, Box, Card, CardContent } from "@mui/material";
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
        <Box sx={{ mb: 4 }}>
          <Typography variant="h5" fontWeight={700}>My Work</Typography>
          <Typography variant="body2" color="text.secondary" sx={{ mt: 0.5 }}>What needs your attention</Typography>
        </Box>

        <Card variant="outlined" sx={{ mb: 4 }}>
          <CardContent><TaskList tasks={data.allOpenTasks} fileMap={fileMap} /></CardContent>
        </Card>

        <Typography variant="h6" fontWeight={600} sx={{ mb: 2 }}>Recently Updated Files</Typography>
        <Box sx={{ display: "grid", gridTemplateColumns: { xs: "1fr", sm: "1fr 1fr" }, gap: 2 }}>
          {data.recentlyUpdatedFiles.map((file) => <FileCard key={file.id} file={file} />)}
        </Box>
      </Container>
    </Box>
  );
}
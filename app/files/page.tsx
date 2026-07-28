import { Container, Typography, Box } from "@mui/material";
import { getRepository } from "@/app/lib/repo-instance";
import { Nav } from "@/app/components/Nav";
import { FileCard } from "@/app/components/FileCard";

export const dynamic = "force-dynamic";

export default async function AllFilesPage() {
  const repo = getRepository();
  const files = await repo.getAllFiles();

  return (
    <Box>
      <Nav active="files" />
      <Container maxWidth="lg" sx={{ py: 4 }}>
        <Box sx={{ mb: 3 }}>
          <Typography variant="h5" fontWeight={700}>All Files</Typography>
          <Typography variant="body2" color="text.secondary" sx={{ mt: 0.5 }}>{files.length} mortgage files</Typography>
        </Box>
        <Box sx={{ display: "grid", gridTemplateColumns: { xs: "1fr", sm: "1fr 1fr", lg: "1fr 1fr 1fr" }, gap: 2 }}>
          {files.map((file) => <FileCard key={file.id} file={file} />)}
        </Box>
      </Container>
    </Box>
  );
}
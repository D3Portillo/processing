import { Container, Box } from "@mui/material";
import { getRepository } from "@/app/lib/repo-instance";
import { Nav } from "@/app/components/Nav";
import { FileGrid } from "@/app/components/FileGrid";

export const dynamic = "force-dynamic";

export default async function AllFilesPage() {
  const repo = getRepository();
  const files = await repo.getAllFiles();

  // TODO: replace with actual auth context
  const currentSpecialistId = "sp-1";

  return (
    <Box>
      <Nav active="files" />
      <Container maxWidth="lg" sx={{ py: 4 }}>
        <FileGrid files={files} currentSpecialistId={currentSpecialistId} />
      </Container>
    </Box>
  );
}
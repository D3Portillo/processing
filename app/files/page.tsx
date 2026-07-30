import { Container, Box } from "@mui/material";
import { getAllFiles } from "@/app/lib/mock-data";
import { Nav } from "@/app/components/Nav";
import { FileGrid } from "@/app/components/FileGrid";

export const dynamic = "force-dynamic";

export default async function AllFilesPage() {
  const files = getAllFiles();

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
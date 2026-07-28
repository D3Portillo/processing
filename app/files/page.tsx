import { getRepository } from "@/app/lib/repo-instance";
import { Nav } from "@/app/components/Nav";
import { FileCard } from "@/app/components/FileCard";

export const dynamic = "force-dynamic";

export default async function AllFilesPage() {
  const repo = getRepository();
  const files = await repo.getAllFiles();

  return (
    <div className="min-h-screen">
      <Nav active="files" />
      <main className="mx-auto max-w-4xl px-6 py-8" style={{ marginTop: "3rem" }}>
        <div className="mb-6">
          <h2 className="text-2xl font-bold">All Files</h2>
          <p className="text-sm text-[var(--cds--text-secondary)] mt-1">{files.length} mortgage files</p>
        </div>
        <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
          {files.map((file) => (
            <FileCard key={file.id} file={file} />
          ))}
        </div>
      </main>
    </div>
  );
}
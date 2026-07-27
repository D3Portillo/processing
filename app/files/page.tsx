import Link from "next/link";
import { getRepository } from "@/app/lib/repo-instance";
import { Card, CardContent, CardHeader, CardTitle } from "@/app/components/ui/card";
import { FileCard } from "@/app/components/FileCard";
import { ArrowLeft } from "lucide-react";

export const dynamic = "force-dynamic";

export default async function AllFilesPage() {
  const repo = getRepository();
  const files = await repo.getAllFiles();

  return (
    <div className="min-h-screen bg-muted/30">
      <header className="border-b bg-background sticky top-0 z-40">
        <div className="mx-auto max-w-5xl px-6 py-4 flex items-center gap-4">
          <Link href="/" className="text-muted-foreground hover:text-foreground">
            <ArrowLeft className="size-5" />
          </Link>
          <div>
            <h1 className="text-xl font-bold">All Files</h1>
            <p className="text-sm text-muted-foreground">{files.length} mortgage files</p>
          </div>
        </div>
      </header>

      <main className="mx-auto max-w-5xl px-6 py-8">
        <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
          {files.map((file) => (
            <FileCard key={file.id} file={file} />
          ))}
        </div>
      </main>
    </div>
  );
}
import { getRepository } from "@/app/lib/repo-instance";
import { Card, CardContent } from "@/app/components/ui/card";
import { Nav } from "@/app/components/Nav";
import { StageBadge } from "@/app/components/StageBadge";
import { Calendar } from "lucide-react";
import Link from "next/link";
import { formatDate, formatRelative, isOverdue } from "@/app/lib/utils";
import type { MortgageFile } from "@/app/lib/types";

export const dynamic = "force-dynamic";

export default async function SalesPage() {
  const repo = getRepository();
  const data = await repo.getDashboardData();

  return (
    <div className="min-h-screen bg-muted/30">
      <Nav active="sales" />
      <main className="mx-auto max-w-4xl px-6 py-8 space-y-6">
        <div>
          <h2 className="text-2xl font-bold">Upcoming Sale Dates</h2>
          <p className="text-sm text-muted-foreground mt-1">Next 30 days</p>
        </div>

        {data.upcomingSaleDates.length === 0 ? (
          <Card>
            <CardContent className="py-12 text-center">
              <p className="text-sm text-muted-foreground">No upcoming sale dates</p>
            </CardContent>
          </Card>
        ) : (
          <div className="space-y-3">
            {data.upcomingSaleDates.map((file: MortgageFile) => (
              <Link key={file.id} href={`/files/${file.id}`}>
                <Card className="transition-shadow hover:shadow-md cursor-pointer">
                  <CardContent className="p-4">
                    <div className="flex items-center justify-between gap-4">
                      <div className="min-w-0 flex-1">
                        <p className="font-semibold truncate">{file.borrower.name}</p>
                        <p className="text-sm text-muted-foreground truncate">{file.lender.name}</p>
                        <p className="text-xs text-muted-foreground mt-1 truncate">{file.borrower.propertyAddress}</p>
                      </div>
                      <div className="text-right shrink-0">
                        <div className="flex items-center justify-end gap-1.5">
                          <Calendar className={`size-4 ${isOverdue(file.saleDate!) ? "text-destructive" : "text-muted-foreground"}`} />
                          <p className={`text-sm font-bold ${isOverdue(file.saleDate!) ? "text-destructive" : ""}`}>
                            {file.saleDate ? formatDate(file.saleDate) : "—"}
                          </p>
                        </div>
                        <p className="text-xs text-muted-foreground mt-0.5">
                          {file.saleDate ? formatRelative(file.saleDate) : ""}
                        </p>
                        <div className="mt-1.5">
                          <StageBadge stage={file.stage} />
                        </div>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              </Link>
            ))}
          </div>
        )}
      </main>
    </div>
  );
}
import { Suspense } from "react";
import { getDashboardRides, getAvailableYears, getYearlyTarget } from "@/features/dashboard/actions";
import { DashboardCards } from "@/features/dashboard/components/dashboard-cards";
import { YearSelector } from "@/features/dashboard/components/year-selector";
import { TargetEditor } from "@/features/dashboard/components/target-editor";

export default async function DashboardPage({
  searchParams,
}: {
  searchParams: Promise<{ [key: string]: string | string[] | undefined }>;
}) {
  const sp = await searchParams;
  const currentYear = new Date().getFullYear();
  const yearParam = typeof sp.year === "string" ? parseInt(sp.year, 10) : currentYear;
  const year = isNaN(yearParam) ? currentYear : yearParam;

  const [rides, availableYears, target] = await Promise.all([
    getDashboardRides(year),
    getAvailableYears(),
    getYearlyTarget(year),
  ]);

  return (
    <div className="mx-auto max-w-4xl px-4 py-8">
      <div className="flex items-center justify-between mb-6">
        <h1 className="text-2xl font-bold">Dashboard</h1>
        <YearSelector years={availableYears} current={year} />
      </div>
      <div className="mb-6">
        <TargetEditor year={year} target={target} />
      </div>
      <Suspense>
        <DashboardCards rides={rides} year={year} />
      </Suspense>
    </div>
  );
}

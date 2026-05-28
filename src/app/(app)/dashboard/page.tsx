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
  const availableYears = await getAvailableYears();

  let year: number;
  if (typeof sp.year === "string" && !isNaN(parseInt(sp.year, 10))) {
    year = parseInt(sp.year, 10);
  } else if (availableYears.length > 0) {
    year = availableYears[0]; // sorted descending — latest year with rides
  } else {
    year = new Date().getFullYear();
  }

  const [rides, target] = await Promise.all([
    getDashboardRides(year),
    getYearlyTarget(year),
  ]);

  return (
    <div className="mx-auto max-w-4xl px-4 py-8">
      <div className="flex items-center justify-between mb-6">
        <h1 className="text-2xl font-bold">Dashboard</h1>
        <div className="flex items-center gap-2">
          <TargetEditor year={year} target={target} />
          {availableYears.length > 0 && (
            <YearSelector years={availableYears} current={year} />
          )}
        </div>
      </div>
      <Suspense>
        <DashboardCards rides={rides} year={year} target={target} hasRidesAnyYear={availableYears.length > 0} />
      </Suspense>
    </div>
  );
}

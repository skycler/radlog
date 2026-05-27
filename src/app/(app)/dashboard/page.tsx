import { Suspense } from "react";
import { getDashboardRides, getAvailableYears } from "@/features/dashboard/actions";
import { DashboardCards } from "@/features/dashboard/components/dashboard-cards";
import { YearSelector } from "@/features/dashboard/components/year-selector";

export default async function DashboardPage({
  searchParams,
}: {
  searchParams: Promise<{ [key: string]: string | string[] | undefined }>;
}) {
  const sp = await searchParams;
  const currentYear = new Date().getFullYear();
  const yearParam = typeof sp.year === "string" ? parseInt(sp.year, 10) : currentYear;
  const year = isNaN(yearParam) ? currentYear : yearParam;

  const [rides, availableYears] = await Promise.all([
    getDashboardRides(year),
    getAvailableYears(),
  ]);

  return (
    <div className="mx-auto max-w-4xl px-4 py-8">
      <div className="flex items-center justify-between mb-6">
        <h1 className="text-2xl font-bold">Dashboard</h1>
        <YearSelector years={availableYears} current={year} />
      </div>
      <Suspense>
        <DashboardCards rides={rides} year={year} />
      </Suspense>
    </div>
  );
}

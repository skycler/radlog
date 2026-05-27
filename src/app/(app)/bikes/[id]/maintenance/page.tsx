import Link from "next/link";
import { getBike, getMaintenanceHistory } from "@/features/bikes/actions";
import { MaintenanceList } from "@/features/bikes/components/maintenance-list";

export default async function MaintenancePage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  const [bike, entries] = await Promise.all([
    getBike(id),
    getMaintenanceHistory(id),
  ]);

  return (
    <div className="mx-auto max-w-4xl px-4 py-8">
      <div className="mb-6">
        <Link
          href="/bikes"
          className="text-sm text-foreground/50 hover:text-foreground transition-colors"
        >
          &larr; Bikes
        </Link>
        <h1 className="mt-2 text-2xl font-bold">{bike.name} — Maintenance</h1>
      </div>

      {entries.length === 0 ? (
        <div className="rounded-md border border-foreground/10 px-4 py-8 text-center">
          <p className="text-foreground/60">
            No maintenance notes yet. Add a maintenance note to a ride with this
            bike to start tracking.
          </p>
        </div>
      ) : (
        <MaintenanceList entries={entries} bikeId={id} />
      )}
    </div>
  );
}

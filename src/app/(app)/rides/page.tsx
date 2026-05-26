import Link from "next/link";
import { Suspense } from "react";
import { PlusIcon } from "@/components/ui/icons";
import { getBikes } from "@/features/bikes/actions";
import { getRides } from "@/features/rides/actions";
import { RideFilters } from "@/features/rides/components/ride-filters";
import { RideList } from "@/features/rides/components/ride-list";

const VALID_SORT = ["date", "distance_km", "elevation_gain_m"] as const;
type SortField = (typeof VALID_SORT)[number];

export default async function RidesPage({
  searchParams,
}: {
  searchParams: Promise<{ [key: string]: string | string[] | undefined }>;
}) {
  const sp = await searchParams;
  const bikeId = typeof sp.bike === "string" ? sp.bike : undefined;
  const dateFrom = typeof sp.from === "string" ? sp.from : undefined;
  const dateTo = typeof sp.to === "string" ? sp.to : undefined;
  const sortRaw = typeof sp.sort === "string" ? sp.sort : "date";
  const sortBy = VALID_SORT.includes(sortRaw as SortField)
    ? (sortRaw as SortField)
    : "date";
  const sortOrder =
    typeof sp.order === "string" && sp.order === "asc" ? "asc" : "desc";

  const [rides, bikes] = await Promise.all([
    getRides({ bike_id: bikeId, date_from: dateFrom, date_to: dateTo, sort_by: sortBy, sort_order: sortOrder }),
    getBikes(),
  ]);

  return (
    <div className="mx-auto max-w-4xl px-4 py-8">
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-bold">Rides</h1>
        <Link
          href="/rides/new"
          className="rounded-md p-1.5 text-foreground/60 hover:text-foreground hover:bg-foreground/5 transition-colors"
          aria-label="Add ride"
        >
          <PlusIcon />
        </Link>
      </div>
      <div className="mt-4">
        <Suspense>
          <RideFilters bikes={bikes} />
        </Suspense>
      </div>
      <div className="mt-4">
        <RideList rides={rides} filtered={!!(bikeId || dateFrom || dateTo)} />
      </div>
    </div>
  );
}

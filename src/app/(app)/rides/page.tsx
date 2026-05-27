import Link from "next/link";
import { Suspense } from "react";
import { PlusIcon, UploadIcon } from "@/components/ui/icons";
import { getBikes } from "@/features/bikes/actions";
import { getRides } from "@/features/rides/actions";
import { RideList } from "@/features/rides/components/ride-list";

const VALID_SORT = ["date", "distance_km", "elevation_gain_m"] as const;
type SortField = (typeof VALID_SORT)[number];

export default async function RidesPage({
  searchParams,
}: {
  searchParams: Promise<{ [key: string]: string | string[] | undefined }>;
}) {
  const sp = await searchParams;

  const bikeIds =
    typeof sp.bikes === "string" && sp.bikes
      ? sp.bikes.split(",").filter(Boolean)
      : undefined;
  const dateFrom = typeof sp.from === "string" ? sp.from : undefined;
  const dateTo = typeof sp.to === "string" ? sp.to : undefined;
  const distFrom =
    typeof sp.dist_from === "string" && sp.dist_from
      ? parseFloat(sp.dist_from)
      : undefined;
  const distTo =
    typeof sp.dist_to === "string" && sp.dist_to
      ? parseFloat(sp.dist_to)
      : undefined;
  const elevFrom =
    typeof sp.elev_from === "string" && sp.elev_from
      ? parseFloat(sp.elev_from)
      : undefined;
  const elevTo =
    typeof sp.elev_to === "string" && sp.elev_to
      ? parseFloat(sp.elev_to)
      : undefined;

  const sortRaw = typeof sp.sort === "string" ? sp.sort : "date";
  const sortBy = VALID_SORT.includes(sortRaw as SortField)
    ? (sortRaw as SortField)
    : "date";
  const sortOrder =
    typeof sp.order === "string" && sp.order === "asc" ? "asc" : "desc";

  const hasFilters = !!(
    bikeIds ||
    dateFrom ||
    dateTo ||
    distFrom !== undefined ||
    distTo !== undefined ||
    elevFrom !== undefined ||
    elevTo !== undefined
  );

  const [rides, bikes] = await Promise.all([
    getRides({
      bike_ids: bikeIds,
      date_from: dateFrom,
      date_to: dateTo,
      distance_from: distFrom,
      distance_to: distTo,
      elevation_from: elevFrom,
      elevation_to: elevTo,
      sort_by: sortBy,
      sort_order: sortOrder,
    }),
    getBikes(),
  ]);

  return (
    <div className="mx-auto max-w-4xl px-4 py-8">
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-bold">Rides</h1>
        <div className="flex items-center gap-1">
          <Link
            href="/rides/import"
            className="rounded-md p-1.5 text-accent-secondary/70 hover:text-accent-secondary hover:bg-accent-secondary/5 transition-colors"
            aria-label="Import rides"
            title="Import rides"
          >
            <UploadIcon />
          </Link>
          <Link
            href="/rides/new"
            className="rounded-md p-1.5 text-accent-secondary/70 hover:text-accent-secondary hover:bg-accent-secondary/5 transition-colors"
            aria-label="Add ride"
            title="Add ride"
          >
            <PlusIcon />
          </Link>
        </div>
      </div>
      <div className="mt-6">
        <Suspense>
          <RideList rides={rides} bikes={bikes} filtered={hasFilters} />
        </Suspense>
      </div>
    </div>
  );
}

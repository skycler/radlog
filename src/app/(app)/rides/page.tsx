import Link from "next/link";
import { PlusIcon } from "@/components/ui/icons";
import { getRides } from "@/features/rides/actions";
import { RideList } from "@/features/rides/components/ride-list";

export default async function RidesPage() {
  const rides = await getRides();

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
      <div className="mt-6">
        <RideList rides={rides} />
      </div>
    </div>
  );
}

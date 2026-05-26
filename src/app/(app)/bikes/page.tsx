import Link from "next/link";
import { PlusIcon } from "@/components/ui/icons";
import { getBikes } from "@/features/bikes/actions";
import { BikeList } from "@/features/bikes/components/bike-list";

export default async function BikesPage() {
  const bikes = await getBikes();

  return (
    <div className="mx-auto max-w-4xl px-4 py-8">
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-bold">Bikes</h1>
        <Link
            href="/bikes/new"
            className="rounded-md p-1.5 text-foreground/60 hover:text-foreground hover:bg-foreground/5 transition-colors"
            aria-label="Add bike"
            title="Add bike"
          >
            <PlusIcon />
          </Link>
      </div>
      <div className="mt-6">
        <BikeList bikes={bikes} />
      </div>
    </div>
  );
}

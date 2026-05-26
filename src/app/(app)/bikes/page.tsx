import Link from "next/link";
import { Button } from "@/components/ui/button";
import { PlusIcon } from "@/components/ui/icons";
import { getBikes } from "@/features/bikes/actions";
import { BikeList } from "@/features/bikes/components/bike-list";

export default async function BikesPage() {
  const bikes = await getBikes();

  return (
    <div className="mx-auto max-w-4xl px-4 py-8">
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-bold">Bikes</h1>
        <Link href="/bikes/new">
          <Button><PlusIcon className="h-4 w-4 -ml-1 mr-1" />Add bike</Button>
        </Link>
      </div>
      <div className="mt-6">
        <BikeList bikes={bikes} />
      </div>
    </div>
  );
}

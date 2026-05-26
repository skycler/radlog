import Link from "next/link";
import { Button } from "@/components/ui/button";
import { PlusIcon } from "@/components/ui/icons";
import { getRides } from "@/features/rides/actions";
import { RideList } from "@/features/rides/components/ride-list";

export default async function RidesPage() {
  const rides = await getRides();

  return (
    <div className="mx-auto max-w-4xl px-4 py-8">
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-bold">Rides</h1>
        <Link href="/rides/new">
          <Button><PlusIcon className="h-4 w-4 -ml-1 mr-1" />Add ride</Button>
        </Link>
      </div>
      <div className="mt-6">
        <RideList rides={rides} />
      </div>
    </div>
  );
}

import { getBikes } from "@/features/bikes/actions";
import { createRide } from "@/features/rides/actions";
import { RideForm } from "@/features/rides/components/ride-form";

export default async function NewRidePage() {
  const bikes = await getBikes();

  return (
    <div className="mx-auto max-w-md px-4 py-8">
      <h1 className="mb-6 text-2xl font-bold">Log a ride</h1>
      <RideForm action={createRide} bikes={bikes} submitLabel="Log ride" />
    </div>
  );
}

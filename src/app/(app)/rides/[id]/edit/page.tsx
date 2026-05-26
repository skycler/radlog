import { getBikes } from "@/features/bikes/actions";
import { getRide, updateRide } from "@/features/rides/actions";
import { RideForm } from "@/features/rides/components/ride-form";
import { notFound } from "next/navigation";

export default async function EditRidePage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;

  let ride;
  try {
    ride = await getRide(id);
  } catch {
    notFound();
  }

  const bikes = await getBikes();
  const action = updateRide.bind(null, id);

  return (
    <div className="mx-auto max-w-md px-4 py-8">
      <h1 className="mb-6 text-2xl font-bold">Edit ride</h1>
      <RideForm
        action={action}
        bikes={bikes}
        defaultValues={{
          date: ride.date,
          distance_km: ride.distance_km,
          elevation_gain_m: ride.elevation_gain_m,
          bike_id: ride.bike_id,
          personal_note: ride.personal_note,
          material_comment: ride.material_comment,
        }}
        submitLabel="Save changes"
      />
    </div>
  );
}

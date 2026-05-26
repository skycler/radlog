import { BikeForm } from "@/features/bikes/components/bike-form";
import { createBike } from "@/features/bikes/actions";

export default function NewBikePage() {
  return (
    <div className="mx-auto max-w-md px-4 py-8">
      <h1 className="mb-6 text-2xl font-bold">Add bike</h1>
      <BikeForm action={createBike} submitLabel="Add bike" />
    </div>
  );
}

import { getBike, updateBike } from "@/features/bikes/actions";
import { BikeForm } from "@/features/bikes/components/bike-form";
import { notFound } from "next/navigation";

export default async function EditBikePage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;

  let bike;
  try {
    bike = await getBike(id);
  } catch {
    notFound();
  }

  const action = updateBike.bind(null, id);

  return (
    <div className="mx-auto max-w-md px-4 py-8">
      <h1 className="mb-6 text-2xl font-bold">Edit bike</h1>
      <BikeForm action={action} defaultName={bike.name} submitLabel="Save changes" />
    </div>
  );
}

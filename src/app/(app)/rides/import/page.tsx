import { getBikes } from "@/features/bikes/actions";
import { RideImportForm } from "@/features/rides/components/ride-import-form";

export default async function ImportRidesPage() {
  const bikes = await getBikes();

  return (
    <div className="mx-auto max-w-4xl px-4 py-8">
      <h1 className="text-2xl font-bold">Import rides</h1>
      <p className="mt-1 text-sm text-foreground/60">
        Upload a CSV file to import multiple rides at once.
      </p>
      <div className="mt-6">
        <RideImportForm bikes={bikes} />
      </div>
    </div>
  );
}

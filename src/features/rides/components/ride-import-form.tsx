"use client";

import { useState, useMemo, useCallback } from "react";
import { useRouter } from "next/navigation";
import Papa from "papaparse";
import { Button } from "@/components/ui/button";
import { CheckIcon, AlertIcon } from "@/components/ui/icons";
import { createBikesForImport, importRides } from "../import-actions";

interface Bike {
  id: string;
  name: string;
}

type RideField =
  | "date"
  | "distance_km"
  | "elevation_gain_m"
  | "bike"
  | "personal_note"
  | "maintenance_note";

const RIDE_FIELDS: { value: RideField; label: string; required: boolean }[] = [
  { value: "date", label: "Date", required: true },
  { value: "distance_km", label: "Distance (km)", required: true },
  { value: "elevation_gain_m", label: "Elevation gain (m)", required: true },
  { value: "bike", label: "Bike", required: true },
  { value: "personal_note", label: "Personal note", required: false },
  { value: "maintenance_note", label: "Maintenance note", required: false },
];

const REQUIRED_FIELDS: RideField[] = RIDE_FIELDS.filter((f) => f.required).map(
  (f) => f.value,
);

const AUTO_MATCH: Record<string, RideField> = {
  date: "date",
  distance: "distance_km",
  distance_km: "distance_km",
  "distance (km)": "distance_km",
  elevation: "elevation_gain_m",
  elevation_gain: "elevation_gain_m",
  elevation_gain_m: "elevation_gain_m",
  "elevation gain": "elevation_gain_m",
  "elevation gain (m)": "elevation_gain_m",
  "elevation (m)": "elevation_gain_m",
  bike: "bike",
  bike_name: "bike",
  personal_note: "personal_note",
  "personal note": "personal_note",
  note: "personal_note",
  maintenance_note: "maintenance_note",
  "maintenance note": "maintenance_note",
  material_comment: "maintenance_note",
  "material comment": "maintenance_note",
};

type Step = "upload" | "review" | "result";

interface RowError {
  row: number;
  errors: string[];
}

interface ParsedRow {
  [key: string]: string;
}

export function RideImportForm({ bikes }: { bikes: Bike[] }) {
  const router = useRouter();
  const [step, setStep] = useState<Step>("upload");
  const [csvHeaders, setCsvHeaders] = useState<string[]>([]);
  const [csvData, setCsvData] = useState<ParsedRow[]>([]);
  const [columnMap, setColumnMap] = useState<Record<string, RideField | "">>(
    {},
  );
  const [bikeMap, setBikeMap] = useState<Record<string, string>>({});
  const [importing, setImporting] = useState(false);
  const [result, setResult] = useState<{
    inserted: number;
    bikesCreated: number;
    error?: string;
  } | null>(null);
  const [fileError, setFileError] = useState<string | null>(null);

  // --- Upload step ---
  function handleFile(file: File) {
    setFileError(null);
    Papa.parse<ParsedRow>(file, {
      header: true,
      skipEmptyLines: true,
      complete(results) {
        if (results.data.length === 0) {
          setFileError("CSV file is empty.");
          return;
        }
        if (results.data.length > 1000) {
          setFileError(
            `CSV has ${results.data.length} rows. Maximum is 1000.`,
          );
          return;
        }
        const headers = results.meta.fields ?? [];
        setCsvHeaders(headers);
        setCsvData(results.data);

        // auto-match columns
        const autoMap: Record<string, RideField | ""> = {};
        const usedFields = new Set<RideField>();
        for (const h of headers) {
          const normalized = h.trim().toLowerCase();
          const match = AUTO_MATCH[normalized];
          if (match && !usedFields.has(match)) {
            autoMap[h] = match;
            usedFields.add(match);
          } else {
            autoMap[h] = "";
          }
        }
        setColumnMap(autoMap);

        // init bike map
        setBikeMap({});

        setStep("review");
      },
      error() {
        setFileError("Failed to parse CSV file.");
      },
    });
  }

  // --- Column matching ---
  const assignedFields = useMemo(() => {
    const set = new Set<RideField>();
    for (const v of Object.values(columnMap)) {
      if (v) set.add(v);
    }
    return set;
  }, [columnMap]);

  const missingRequired = useMemo(
    () => REQUIRED_FIELDS.filter((f) => !assignedFields.has(f)),
    [assignedFields],
  );

  // --- Bike matching ---
  const bikeColumn = useMemo(() => {
    for (const [header, field] of Object.entries(columnMap)) {
      if (field === "bike") return header;
    }
    return null;
  }, [columnMap]);

  const uniqueBikeNames = useMemo(() => {
    if (!bikeColumn) return [];
    const names = new Set<string>();
    for (const row of csvData) {
      const val = row[bikeColumn]?.trim();
      if (val) names.add(val);
    }
    return Array.from(names).sort();
  }, [bikeColumn, csvData]);

  // Auto-match bikes on bikeColumn change
  const effectiveBikeMap = useMemo(() => {
    const map: Record<string, string> = {};
    for (const name of uniqueBikeNames) {
      if (bikeMap[name]) {
        map[name] = bikeMap[name];
      } else {
        const match = bikes.find(
          (b) => b.name.toLowerCase() === name.toLowerCase(),
        );
        if (match) map[name] = match.id;
      }
    }
    return map;
  }, [uniqueBikeNames, bikeMap, bikes]);

  const unmatchedBikes = useMemo(
    () => uniqueBikeNames.filter((n) => !effectiveBikeMap[n]),
    [uniqueBikeNames, effectiveBikeMap],
  );

  // --- Validation ---
  const { validRows, rowErrors } = useMemo(() => {
    if (missingRequired.length > 0)
      return { validRows: [] as ParsedRow[], rowErrors: [] as RowError[] };

    const valid: ParsedRow[] = [];
    const errors: RowError[] = [];

    // Build reverse map: field -> header
    const fieldToHeader: Partial<Record<RideField, string>> = {};
    for (const [h, f] of Object.entries(columnMap)) {
      if (f) fieldToHeader[f] = h;
    }

    for (let i = 0; i < csvData.length; i++) {
      const row = csvData[i];
      const errs: string[] = [];

      // date
      const dateVal = row[fieldToHeader.date!]?.trim();
      if (!dateVal) {
        errs.push("Missing date");
      } else if (!/^\d{4}-\d{2}-\d{2}$/.test(dateVal) && isNaN(Date.parse(dateVal))) {
        errs.push(`Invalid date: "${dateVal}"`);
      }

      // distance
      const distVal = row[fieldToHeader.distance_km!]?.trim();
      if (!distVal) {
        errs.push("Missing distance");
      } else if (isNaN(parseFloat(distVal)) || parseFloat(distVal) < 0) {
        errs.push(`Invalid distance: "${distVal}"`);
      }

      // elevation
      const elevVal = row[fieldToHeader.elevation_gain_m!]?.trim();
      if (!elevVal) {
        errs.push("Missing elevation");
      } else if (isNaN(parseFloat(elevVal)) || parseFloat(elevVal) < 0) {
        errs.push(`Invalid elevation: "${elevVal}"`);
      }

      // bike
      const bikeName = row[fieldToHeader.bike!]?.trim();
      if (!bikeName) {
        errs.push("Missing bike");
      } else if (!effectiveBikeMap[bikeName]) {
        errs.push(`Unmatched bike: "${bikeName}"`);
      }

      if (errs.length > 0) {
        errors.push({ row: i + 1, errors: errs });
      } else {
        valid.push(row);
      }
    }

    return { validRows: valid, rowErrors: errors };
  }, [csvData, columnMap, effectiveBikeMap, missingRequired]);

  // --- Import ---
  const handleImport = useCallback(async () => {
    if (validRows.length === 0) return;
    setImporting(true);

    try {
      // Build reverse map
      const fieldToHeader: Partial<Record<RideField, string>> = {};
      for (const [h, f] of Object.entries(columnMap)) {
        if (f) fieldToHeader[f] = h;
      }

      // Create new bikes first
      const newBikeNames = uniqueBikeNames.filter(
        (n) => effectiveBikeMap[n] === "__new__",
      );
      let allBikeMap = { ...effectiveBikeMap };

      if (newBikeNames.length > 0) {
        const { bikes: created, error } =
          await createBikesForImport(newBikeNames);
        if (error) {
          setResult({ inserted: 0, bikesCreated: 0, error });
          setStep("result");
          setImporting(false);
          return;
        }
        for (const b of created) {
          allBikeMap[b.name] = b.id;
        }
      }

      // Normalize date
      function normalizeDate(val: string): string {
        if (/^\d{4}-\d{2}-\d{2}$/.test(val)) return val;
        const d = new Date(val);
        return d.toISOString().split("T")[0];
      }

      const rides = validRows.map((row) => ({
        date: normalizeDate(row[fieldToHeader.date!].trim()),
        distance_km: parseFloat(row[fieldToHeader.distance_km!].trim()),
        elevation_gain_m: parseFloat(
          row[fieldToHeader.elevation_gain_m!].trim(),
        ),
        bike_id: allBikeMap[row[fieldToHeader.bike!].trim()],
        personal_note: fieldToHeader.personal_note
          ? row[fieldToHeader.personal_note]?.trim() || null
          : null,
        maintenance_note: fieldToHeader.maintenance_note
          ? row[fieldToHeader.maintenance_note]?.trim() || null
          : null,
      }));

      const res = await importRides(rides);
      setResult({
        ...res,
        bikesCreated: newBikeNames.length,
      });
      setStep("result");
    } catch {
      setResult({
        inserted: 0,
        bikesCreated: 0,
        error: "An unexpected error occurred",
      });
      setStep("result");
    } finally {
      setImporting(false);
    }
  }, [validRows, columnMap, effectiveBikeMap, uniqueBikeNames]);

  // --- Render ---
  if (step === "upload") {
    return <UploadStep onFile={handleFile} error={fileError} />;
  }

  if (step === "result") {
    return (
      <ResultStep
        result={result!}
        onDone={() => router.push("/rides")}
        onRetry={() => {
          setStep("upload");
          setCsvHeaders([]);
          setCsvData([]);
          setResult(null);
        }}
      />
    );
  }

  // Review step
  return (
    <div className="space-y-8">
      {/* Column matching */}
      <section>
        <h2 className="text-lg font-semibold">Column matching</h2>
        <p className="mt-1 text-sm text-foreground/60">
          Map each CSV column to a ride field.
        </p>
        <div className="mt-3 space-y-2">
          {csvHeaders.map((header) => (
            <div key={header} className="flex items-center gap-3">
              <span className="w-40 truncate text-sm font-mono text-foreground/80">
                {header}
              </span>
              <span className="text-foreground/30">&rarr;</span>
              <select
                value={columnMap[header] || ""}
                onChange={(e) =>
                  setColumnMap((prev) => ({
                    ...prev,
                    [header]: e.target.value as RideField | "",
                  }))
                }
                className="rounded-md border border-foreground/20 bg-background px-3 py-1.5 text-sm text-foreground focus:border-foreground/50 focus:outline-none focus:ring-1 focus:ring-foreground/50"
              >
                <option value="">Skip</option>
                {RIDE_FIELDS.map((f) => (
                  <option
                    key={f.value}
                    value={f.value}
                    disabled={
                      assignedFields.has(f.value) &&
                      columnMap[header] !== f.value
                    }
                  >
                    {f.label}
                    {f.required ? " *" : ""}
                  </option>
                ))}
              </select>
            </div>
          ))}
        </div>
        {missingRequired.length > 0 && (
          <p className="mt-2 text-sm text-red-500">
            Missing required fields:{" "}
            {missingRequired
              .map((f) => RIDE_FIELDS.find((rf) => rf.value === f)!.label)
              .join(", ")}
          </p>
        )}
      </section>

      {/* Bike matching */}
      {bikeColumn && uniqueBikeNames.length > 0 && (
        <section>
          <h2 className="text-lg font-semibold">Bike matching</h2>
          <p className="mt-1 text-sm text-foreground/60">
            Match each bike name from the CSV to an existing bike or create a
            new one.
          </p>
          <div className="mt-3 space-y-2">
            {uniqueBikeNames.map((name) => (
              <div key={name} className="flex items-center gap-3">
                <span className="w-40 truncate text-sm font-mono text-foreground/80">
                  {name}
                </span>
                <span className="text-foreground/30">&rarr;</span>
                <select
                  value={effectiveBikeMap[name] || ""}
                  onChange={(e) =>
                    setBikeMap((prev) => ({ ...prev, [name]: e.target.value }))
                  }
                  className="rounded-md border border-foreground/20 bg-background px-3 py-1.5 text-sm text-foreground focus:border-foreground/50 focus:outline-none focus:ring-1 focus:ring-foreground/50"
                >
                  <option value="">-- Select --</option>
                  <option value="__new__">+ Create new bike</option>
                  {bikes.map((b) => (
                    <option key={b.id} value={b.id}>
                      {b.name}
                    </option>
                  ))}
                </select>
              </div>
            ))}
          </div>
        </section>
      )}

      {/* Validation summary */}
      {missingRequired.length === 0 && (
        <section>
          <h2 className="text-lg font-semibold">Validation</h2>
          <div className="mt-2 flex gap-4 text-sm">
            <span className="text-foreground/80">
              {csvData.length} total rows
            </span>
            <span className="text-green-600">{validRows.length} valid</span>
            {rowErrors.length > 0 && (
              <span className="text-red-500">{rowErrors.length} invalid</span>
            )}
          </div>
          {rowErrors.length > 0 && (
            <div className="mt-2 max-h-48 overflow-y-auto rounded-md border border-foreground/10 p-3 text-sm">
              {rowErrors.slice(0, 50).map((e) => (
                <div key={e.row} className="text-foreground/70">
                  <span className="font-mono text-red-500">Row {e.row}:</span>{" "}
                  {e.errors.join(", ")}
                </div>
              ))}
              {rowErrors.length > 50 && (
                <p className="mt-1 text-foreground/40">
                  ...and {rowErrors.length - 50} more
                </p>
              )}
            </div>
          )}
        </section>
      )}

      {/* Actions */}
      <div className="flex gap-3">
        <Button
          onClick={handleImport}
          disabled={
            importing ||
            validRows.length === 0 ||
            missingRequired.length > 0 ||
            unmatchedBikes.length > 0
          }
        >
          {importing
            ? "Importing..."
            : `Import ${validRows.length} ride${validRows.length !== 1 ? "s" : ""}`}
        </Button>
        <Button
          variant="secondary"
          onClick={() => {
            setStep("upload");
            setCsvHeaders([]);
            setCsvData([]);
          }}
        >
          Back
        </Button>
      </div>
    </div>
  );
}

function UploadStep({
  onFile,
  error,
}: {
  onFile: (file: File) => void;
  error: string | null;
}) {
  const [dragOver, setDragOver] = useState(false);

  return (
    <div
      className={`flex flex-col items-center justify-center rounded-md border-2 border-dashed px-6 py-16 transition-colors ${
        dragOver
          ? "border-foreground/40 bg-foreground/5"
          : "border-foreground/20"
      }`}
      onDragOver={(e) => {
        e.preventDefault();
        setDragOver(true);
      }}
      onDragLeave={() => setDragOver(false)}
      onDrop={(e) => {
        e.preventDefault();
        setDragOver(false);
        const file = e.dataTransfer.files[0];
        if (file) onFile(file);
      }}
    >
      <p className="text-foreground/60 text-sm">
        Drag and drop a CSV file here, or
      </p>
      <label className="mt-3 cursor-pointer">
        <Button
          variant="secondary"
          onClick={() =>
            (
              document.querySelector(
                'input[type="file"]',
              ) as HTMLInputElement
            )?.click()
          }
        >
          Choose file
        </Button>
        <input
          type="file"
          accept=".csv,text/csv"
          className="hidden"
          onChange={(e) => {
            const file = e.target.files?.[0];
            if (file) onFile(file);
          }}
        />
      </label>
      <p className="mt-2 text-xs text-foreground/40">
        Maximum 1000 rows per file
      </p>
      {error && (
        <p className="mt-3 text-sm text-red-500">{error}</p>
      )}
    </div>
  );
}

function ResultStep({
  result,
  onDone,
  onRetry,
}: {
  result: { inserted: number; bikesCreated: number; error?: string };
  onDone: () => void;
  onRetry: () => void;
}) {
  if (result.error) {
    return (
      <div className="flex flex-col items-center py-16 text-center">
        <AlertIcon className="h-10 w-10 text-red-500" />
        <h2 className="mt-4 text-lg font-semibold">Import failed</h2>
        <p className="mt-1 text-sm text-foreground/60">{result.error}</p>
        <Button className="mt-6" variant="secondary" onClick={onRetry}>
          Try again
        </Button>
      </div>
    );
  }

  return (
    <div className="flex flex-col items-center py-16 text-center">
      <CheckIcon className="h-10 w-10 text-green-600" />
      <h2 className="mt-4 text-lg font-semibold">Import complete</h2>
      <p className="mt-1 text-sm text-foreground/60">
        {result.inserted} ride{result.inserted !== 1 ? "s" : ""} imported
        {result.bikesCreated > 0 &&
          `, ${result.bikesCreated} new bike${result.bikesCreated !== 1 ? "s" : ""} created`}
        .
      </p>
      <Button className="mt-6" onClick={onDone}>
        View rides
      </Button>
    </div>
  );
}

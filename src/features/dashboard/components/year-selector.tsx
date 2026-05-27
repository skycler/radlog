"use client";

import { useRouter } from "next/navigation";

interface Props {
  years: number[];
  current: number;
}

export function YearSelector({ years, current }: Props) {
  const router = useRouter();

  return (
    <select
      value={current}
      onChange={(e) => {
        const year = e.target.value;
        router.push(`/dashboard?year=${year}`);
      }}
      className="rounded-md border border-foreground/10 bg-background px-3 py-1.5 text-sm text-foreground focus:outline-none focus:ring-2 focus:ring-accent/50"
    >
      {years.map((y) => (
        <option key={y} value={y}>
          {y}
        </option>
      ))}
    </select>
  );
}

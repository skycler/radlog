"use client";

import { useEffect, useRef } from "react";

interface PlotChartProps {
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  buildOptions: (Plot: any) => any;
  className?: string;
}

export function PlotChart({ buildOptions, className = "" }: PlotChartProps) {
  const containerRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const container = containerRef.current;
    if (!container) return;

    let cancelled = false;

    import("@observablehq/plot").then((Plot) => {
      if (cancelled) return;
      const options = buildOptions(Plot);
      const plot = Plot.plot({
        ...options,
        style: {
          background: "transparent",
          color: "currentColor",
          fontSize: "12px",
          ...(typeof options.style === "object" ? options.style : {}),
        },
      });
      container.replaceChildren(plot);
    });

    return () => {
      cancelled = true;
    };
  }, [buildOptions]);

  return <div ref={containerRef} className={className} />;
}

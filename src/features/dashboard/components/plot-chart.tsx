"use client";

import { useEffect, useRef, useState } from "react";

interface PlotChartProps {
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  buildOptions: (Plot: any) => any;
  className?: string;
}

export function PlotChart({ buildOptions, className = "" }: PlotChartProps) {
  const containerRef = useRef<HTMLDivElement>(null);
  const [width, setWidth] = useState<number | undefined>(undefined);
  const baseWidthRef = useRef<number | null>(null);

  useEffect(() => {
    const container = containerRef.current;
    if (!container) return;

    const observer = new ResizeObserver((entries) => {
      for (const entry of entries) {
        const w = entry.contentRect.width;
        if (baseWidthRef.current === null) baseWidthRef.current = w;
        setWidth(w);
      }
    });
    observer.observe(container);
    return () => observer.disconnect();
  }, []);

  useEffect(() => {
    const container = containerRef.current;
    if (!container || width === undefined) return;

    let cancelled = false;

    import("@observablehq/plot").then((Plot) => {
      if (cancelled) return;
      const options = buildOptions(Plot);
      const scale =
        baseWidthRef.current && baseWidthRef.current > 0
          ? width / baseWidthRef.current
          : 1;
      const height = options.height
        ? Math.round(options.height * scale)
        : undefined;
      const plot = Plot.plot({
        ...options,
        width,
        height: height ?? options.height,
        style: {
          background: "transparent",
          color: "currentColor",
          fontSize: "12px",
          fontFamily: "var(--font-jetbrains-mono), ui-monospace, monospace",
          ...(typeof options.style === "object" ? options.style : {}),
        },
      });
      container.replaceChildren(plot);
    });

    return () => {
      cancelled = true;
    };
  }, [buildOptions, width]);

  return <div ref={containerRef} className={className} />;
}

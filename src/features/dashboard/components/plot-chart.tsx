"use client";

import { useEffect, useRef } from "react";
import * as Plot from "@observablehq/plot";

interface PlotChartProps {
  options: Plot.PlotOptions;
  className?: string;
}

export function PlotChart({ options, className = "" }: PlotChartProps) {
  const containerRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const container = containerRef.current;
    if (!container) return;

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

    return () => {
      plot.remove();
    };
  }, [options]);

  return <div ref={containerRef} className={className} />;
}

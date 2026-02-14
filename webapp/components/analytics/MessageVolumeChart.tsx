"use client";

import {
  ChartComponent,
  SeriesCollectionDirective,
  SeriesDirective,
  Inject,
  DateTime,
  Tooltip,
  SplineAreaSeries,
} from "@syncfusion/ej2-react-charts";
import { IconMessages } from "@tabler/icons-react";
import type { MessageVolumeData } from "@/app/actions/analytics";

interface MessageVolumeChartProps {
  data: MessageVolumeData[];
}

export function MessageVolumeChart({ data }: MessageVolumeChartProps) {
  const hasData = data.some((d) => d.count > 0);

  if (!hasData) {
    return (
      <div className="bg-white dark:bg-neutral-800 rounded-lg border border-gray-200 dark:border-neutral-700 p-4">
        <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">
          Message Volume
        </h3>
        <div className="flex flex-col items-center justify-center h-[250px]">
          <IconMessages className="w-12 h-12 text-gray-300 dark:text-gray-600 mb-3" />
          <p className="text-gray-500 dark:text-gray-400 text-sm">No messages yet</p>
        </div>
      </div>
    );
  }

  const chartData = data.map((d) => ({
    x: new Date(d.date),
    y: d.count,
  }));

  return (
    <div className="bg-white dark:bg-neutral-800 rounded-lg border border-gray-200 dark:border-neutral-700 p-4">
      <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">
        Message Volume
      </h3>
      <ChartComponent
        height="250px"
        background="transparent"
        primaryXAxis={{
          valueType: "DateTime",
          labelFormat: "MMM dd",
          majorGridLines: { width: 0 },
          labelStyle: { color: "#a3a3a3" },
          lineStyle: { color: "#525252" },
        }}
        primaryYAxis={{
          minimum: 0,
          majorGridLines: { color: "#404040", width: 0.5 },
          labelStyle: { color: "#a3a3a3" },
          lineStyle: { width: 0 },
        }}
        tooltip={{ enable: true }}
        chartArea={{ border: { width: 0 } }}
      >
        <Inject services={[SplineAreaSeries, DateTime, Tooltip]} />
        <SeriesCollectionDirective>
          <SeriesDirective
            dataSource={chartData}
            xName="x"
            yName="y"
            name="Messages"
            type="SplineArea"
            fill="#8b5cf6"
            opacity={0.3}
            border={{ width: 2, color: "#8b5cf6" }}
          />
        </SeriesCollectionDirective>
      </ChartComponent>
    </div>
  );
}

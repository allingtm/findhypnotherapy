"use client";

import {
  ChartComponent,
  SeriesCollectionDirective,
  SeriesDirective,
  Inject,
  Category,
  Tooltip,
  ColumnSeries,
} from "@syncfusion/ej2-react-charts";
import { IconCalendarStats } from "@tabler/icons-react";
import type { BookingDayData } from "@/app/actions/analytics";

interface BookingsByDayChartProps {
  data: BookingDayData[];
}

export function BookingsByDayChart({ data }: BookingsByDayChartProps) {
  const hasData = data.some((d) => d.count > 0);

  if (!hasData) {
    return (
      <div className="bg-white dark:bg-neutral-800 rounded-lg border border-gray-200 dark:border-neutral-700 p-4">
        <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">
          Bookings by Day
        </h3>
        <div className="flex flex-col items-center justify-center h-[250px]">
          <IconCalendarStats className="w-12 h-12 text-gray-300 dark:text-gray-600 mb-3" />
          <p className="text-gray-500 dark:text-gray-400 text-sm">No data yet</p>
        </div>
      </div>
    );
  }

  // Reorder to start from Monday
  const reordered = [
    ...data.slice(1), // Mon-Sat
    data[0], // Sunday
  ];

  return (
    <div className="bg-white dark:bg-neutral-800 rounded-lg border border-gray-200 dark:border-neutral-700 p-4">
      <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">
        Bookings by Day
      </h3>
      <ChartComponent
        height="250px"
        background="transparent"
        primaryXAxis={{
          valueType: "Category",
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
        <Inject services={[ColumnSeries, Category, Tooltip]} />
        <SeriesCollectionDirective>
          <SeriesDirective
            dataSource={reordered.map((d) => ({
              x: d.day.slice(0, 3),
              y: d.count,
            }))}
            xName="x"
            yName="y"
            type="Column"
            fill="#3b82f6"
            cornerRadius={{ topLeft: 4, topRight: 4 }}
          />
        </SeriesCollectionDirective>
      </ChartComponent>
    </div>
  );
}

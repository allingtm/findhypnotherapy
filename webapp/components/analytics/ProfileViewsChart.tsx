"use client";

import {
  ChartComponent,
  SeriesCollectionDirective,
  SeriesDirective,
  Inject,
  DateTime,
  Legend,
  Tooltip,
  SplineAreaSeries,
} from "@syncfusion/ej2-react-charts";
import { IconEye } from "@tabler/icons-react";
import type { ProfileViewTrendData } from "@/app/actions/analytics";

interface ProfileViewsChartProps {
  data: ProfileViewTrendData[];
}

export function ProfileViewsChart({ data }: ProfileViewsChartProps) {
  const hasData = data.some((d) => d.views > 0);

  if (!hasData) {
    return (
      <div className="bg-white dark:bg-neutral-800 rounded-lg border border-gray-200 dark:border-neutral-700 p-4">
        <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">
          Profile Views
        </h3>
        <div className="flex flex-col items-center justify-center h-[250px]">
          <IconEye className="w-12 h-12 text-gray-300 dark:text-gray-600 mb-3" />
          <p className="text-gray-500 dark:text-gray-400 text-sm">
            No profile view data yet
          </p>
          <p className="text-gray-400 dark:text-gray-500 text-xs mt-1">
            Views will be tracked when visitors view your public profile
          </p>
        </div>
      </div>
    );
  }

  const chartData = data.map((d) => ({
    x: new Date(d.date),
    views: d.views,
    uniqueVisitors: d.uniqueVisitors,
  }));

  return (
    <div className="bg-white dark:bg-neutral-800 rounded-lg border border-gray-200 dark:border-neutral-700 p-4">
      <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">
        Profile Views
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
        legendSettings={{
          visible: true,
          position: "Top",
          textStyle: { color: "#a3a3a3" },
        }}
        chartArea={{ border: { width: 0 } }}
      >
        <Inject services={[SplineAreaSeries, DateTime, Legend, Tooltip]} />
        <SeriesCollectionDirective>
          <SeriesDirective
            dataSource={chartData}
            xName="x"
            yName="views"
            name="Total Views"
            type="SplineArea"
            fill="#f97316"
            opacity={0.3}
            border={{ width: 2, color: "#f97316" }}
          />
          <SeriesDirective
            dataSource={chartData}
            xName="x"
            yName="uniqueVisitors"
            name="Unique Visitors"
            type="SplineArea"
            fill="#06b6d4"
            opacity={0.3}
            border={{ width: 2, color: "#06b6d4" }}
          />
        </SeriesCollectionDirective>
      </ChartComponent>
    </div>
  );
}

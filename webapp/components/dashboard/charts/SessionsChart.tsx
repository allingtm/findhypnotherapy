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
  Category,
} from "@syncfusion/ej2-react-charts";
import { IconChartLine } from "@tabler/icons-react";
import type { SessionTrendData } from "@/app/actions/dashboard";
import { SectionHeader } from "../SectionHeader";
import { DASHBOARD_HELP } from "../helpContent";

interface SessionsChartProps {
  data: SessionTrendData[];
}

export function SessionsChart({ data }: SessionsChartProps) {
  if (!data || data.length === 0) {
    return (
      <div className="bg-white dark:bg-neutral-800 rounded-lg border border-gray-200 dark:border-neutral-700 p-4">
        <SectionHeader
          title="Sessions Over Time"
          helpTitle={DASHBOARD_HELP.sessionsChart.title}
          helpContent={DASHBOARD_HELP.sessionsChart.content}
          className="mb-4"
        />
        <div className="flex flex-col items-center justify-center h-[250px]">
          <IconChartLine className="w-12 h-12 text-gray-300 dark:text-gray-600 mb-3" />
          <p className="text-gray-500 dark:text-gray-400 text-sm">
            No session data available
          </p>
          <p className="text-gray-400 dark:text-gray-500 text-xs mt-1">
            Data will appear once you have sessions
          </p>
        </div>
      </div>
    );
  }

  // Transform dates for chart
  const chartData = data.map((d) => ({
    x: new Date(d.date),
    sessions: d.sessions,
    bookings: d.bookings,
  }));

  return (
    <div className="bg-white dark:bg-neutral-800 rounded-lg border border-gray-200 dark:border-neutral-700 p-4">
      <SectionHeader
        title="Sessions Over Time"
        helpTitle={DASHBOARD_HELP.sessionsChart.title}
        helpContent={DASHBOARD_HELP.sessionsChart.content}
        className="mb-4"
      />
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
          labelFormat: "{value}",
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
        <Inject services={[SplineAreaSeries, DateTime, Legend, Tooltip, Category]} />
        <SeriesCollectionDirective>
          <SeriesDirective
            dataSource={chartData}
            xName="x"
            yName="sessions"
            name="Client Sessions"
            type="SplineArea"
            fill="#22c55e"
            opacity={0.3}
            border={{ width: 2, color: "#22c55e" }}
          />
          <SeriesDirective
            dataSource={chartData}
            xName="x"
            yName="bookings"
            name="Bookings"
            type="SplineArea"
            fill="#3b82f6"
            opacity={0.3}
            border={{ width: 2, color: "#3b82f6" }}
          />
        </SeriesCollectionDirective>
      </ChartComponent>
    </div>
  );
}

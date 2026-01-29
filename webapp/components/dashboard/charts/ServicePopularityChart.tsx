"use client";

import {
  ChartComponent,
  SeriesCollectionDirective,
  SeriesDirective,
  Inject,
  Legend,
  Tooltip,
  Category,
  BarSeries,
  DataLabel,
} from "@syncfusion/ej2-react-charts";
import { IconChartBar } from "@tabler/icons-react";
import type { ServicePopularityData } from "@/app/actions/dashboard";
import { SectionHeader } from "../SectionHeader";
import { DASHBOARD_HELP } from "../helpContent";

interface ServicePopularityChartProps {
  data: ServicePopularityData[];
}

export function ServicePopularityChart({ data }: ServicePopularityChartProps) {
  if (!data || data.length === 0) {
    return (
      <div className="bg-white dark:bg-neutral-800 rounded-lg border border-gray-200 dark:border-neutral-700 p-4">
        <SectionHeader
          title="Popular Services"
          helpTitle={DASHBOARD_HELP.servicePopularity.title}
          helpContent={DASHBOARD_HELP.servicePopularity.content}
          className="mb-4"
        />
        <div className="flex flex-col items-center justify-center h-[250px]">
          <IconChartBar className="w-12 h-12 text-gray-300 dark:text-gray-600 mb-3" />
          <p className="text-gray-500 dark:text-gray-400 text-sm">
            No booking data available
          </p>
          <p className="text-gray-400 dark:text-gray-500 text-xs mt-1">
            Service popularity will appear after bookings
          </p>
        </div>
      </div>
    );
  }

  // Truncate long service names
  const chartData = data.map((d) => ({
    x: d.serviceName.length > 25 ? d.serviceName.substring(0, 22) + "..." : d.serviceName,
    y: d.count,
  }));

  return (
    <div className="bg-white dark:bg-neutral-800 rounded-lg border border-gray-200 dark:border-neutral-700 p-4">
      <SectionHeader
        title="Popular Services"
        helpTitle={DASHBOARD_HELP.servicePopularity.title}
        helpContent={DASHBOARD_HELP.servicePopularity.content}
        className="mb-4"
      />
      <ChartComponent
        height="250px"
        background="transparent"
        primaryXAxis={{
          valueType: "Category",
          majorGridLines: { width: 0 },
          labelStyle: { color: "#a3a3a3", size: "11px" },
          lineStyle: { width: 0 },
        }}
        primaryYAxis={{
          minimum: 0,
          labelFormat: "{value}",
          majorGridLines: { color: "#404040", width: 0.5 },
          labelStyle: { color: "#a3a3a3" },
          lineStyle: { width: 0 },
        }}
        tooltip={{ enable: true }}
        chartArea={{ border: { width: 0 } }}
      >
        <Inject services={[BarSeries, Legend, Tooltip, Category, DataLabel]} />
        <SeriesCollectionDirective>
          <SeriesDirective
            dataSource={chartData}
            xName="x"
            yName="y"
            name="Bookings"
            type="Bar"
            fill="#8b5cf6"
            cornerRadius={{ topRight: 4, bottomRight: 4 }}
            marker={{
              dataLabel: {
                visible: true,
                position: "Top",
                font: { color: "#a3a3a3", size: "11px" },
              },
            }}
          />
        </SeriesCollectionDirective>
      </ChartComponent>
    </div>
  );
}

"use client";

import {
  AccumulationChartComponent,
  AccumulationSeriesCollectionDirective,
  AccumulationSeriesDirective,
  PieSeries,
  AccumulationLegend,
  AccumulationTooltip,
  AccumulationDataLabel,
  Inject,
} from "@syncfusion/ej2-react-charts";
import { IconDeviceLaptop } from "@tabler/icons-react";
import type { SessionFormatData } from "@/app/actions/dashboard";
import { SectionHeader } from "../SectionHeader";
import { DASHBOARD_HELP } from "../helpContent";

interface SessionFormatChartProps {
  data: SessionFormatData[];
}

const FORMAT_COLORS: Record<string, string> = {
  online: "#3b82f6",
  "in-person": "#22c55e",
  phone: "#8b5cf6",
  other: "#6b7280",
};

const FORMAT_LABELS: Record<string, string> = {
  online: "Online",
  "in-person": "In-Person",
  phone: "Phone",
  other: "Other",
};

export function SessionFormatChart({ data }: SessionFormatChartProps) {
  if (!data || data.length === 0) {
    return (
      <div className="bg-white dark:bg-neutral-800 rounded-lg border border-gray-200 dark:border-neutral-700 p-4">
        <SectionHeader
          title="Session Formats"
          helpTitle={DASHBOARD_HELP.sessionFormats.title}
          helpContent={DASHBOARD_HELP.sessionFormats.content}
          className="mb-4"
        />
        <div className="flex flex-col items-center justify-center h-[250px]">
          <IconDeviceLaptop className="w-12 h-12 text-gray-300 dark:text-gray-600 mb-3" />
          <p className="text-gray-500 dark:text-gray-400 text-sm">
            No format data available
          </p>
          <p className="text-gray-400 dark:text-gray-500 text-xs mt-1">
            Format breakdown will appear after sessions
          </p>
        </div>
      </div>
    );
  }

  const chartData = data.map((d) => ({
    x: FORMAT_LABELS[d.format] || d.format.charAt(0).toUpperCase() + d.format.slice(1),
    y: d.count,
    fill: FORMAT_COLORS[d.format] || "#6b7280",
  }));

  const total = data.reduce((sum, d) => sum + d.count, 0);

  return (
    <div className="bg-white dark:bg-neutral-800 rounded-lg border border-gray-200 dark:border-neutral-700 p-4">
      <SectionHeader
        title="Session Formats"
        helpTitle={DASHBOARD_HELP.sessionFormats.title}
        helpContent={DASHBOARD_HELP.sessionFormats.content}
        className="mb-4"
      />
      <AccumulationChartComponent
        height="250px"
        background="transparent"
        legendSettings={{
          visible: true,
          position: "Bottom",
          textStyle: { color: "#a3a3a3" },
        }}
        tooltip={{
          enable: true,
          format: "${point.x}: ${point.y} (${point.percentage}%)",
        }}
      >
        <Inject
          services={[
            PieSeries,
            AccumulationLegend,
            AccumulationTooltip,
            AccumulationDataLabel,
          ]}
        />
        <AccumulationSeriesCollectionDirective>
          <AccumulationSeriesDirective
            dataSource={chartData}
            xName="x"
            yName="y"
            pointColorMapping="fill"
            dataLabel={{
              visible: true,
              position: "Inside",
              name: "y",
              font: { color: "#ffffff", size: "12px", fontWeight: "600" },
            }}
          />
        </AccumulationSeriesCollectionDirective>
      </AccumulationChartComponent>
    </div>
  );
}

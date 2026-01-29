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
import { IconUsers } from "@tabler/icons-react";
import type { ClientStatusData } from "@/app/actions/dashboard";
import { SectionHeader } from "../SectionHeader";
import { DASHBOARD_HELP } from "../helpContent";

interface ClientStatusChartProps {
  data: ClientStatusData[];
}

const STATUS_COLORS: Record<string, string> = {
  invited: "#3b82f6",
  onboarding: "#f59e0b",
  active: "#22c55e",
  archived: "#6b7280",
};

const STATUS_LABELS: Record<string, string> = {
  invited: "Invited",
  onboarding: "Onboarding",
  active: "Active",
  archived: "Archived",
};

export function ClientStatusChart({ data }: ClientStatusChartProps) {
  if (!data || data.length === 0) {
    return (
      <div className="bg-white dark:bg-neutral-800 rounded-lg border border-gray-200 dark:border-neutral-700 p-4">
        <SectionHeader
          title="Client Distribution"
          helpTitle={DASHBOARD_HELP.clientStatus.title}
          helpContent={DASHBOARD_HELP.clientStatus.content}
          className="mb-4"
        />
        <div className="flex flex-col items-center justify-center h-[250px]">
          <IconUsers className="w-12 h-12 text-gray-300 dark:text-gray-600 mb-3" />
          <p className="text-gray-500 dark:text-gray-400 text-sm">
            No clients yet
          </p>
          <p className="text-gray-400 dark:text-gray-500 text-xs mt-1">
            Add clients to see the distribution
          </p>
        </div>
      </div>
    );
  }

  const chartData = data.map((d) => ({
    x: STATUS_LABELS[d.status] || d.status.charAt(0).toUpperCase() + d.status.slice(1),
    y: d.count,
    fill: STATUS_COLORS[d.status] || "#6b7280",
  }));

  const total = data.reduce((sum, d) => sum + d.count, 0);

  return (
    <div className="bg-white dark:bg-neutral-800 rounded-lg border border-gray-200 dark:border-neutral-700 p-4">
      <SectionHeader
        title="Client Distribution"
        helpTitle={DASHBOARD_HELP.clientStatus.title}
        helpContent={DASHBOARD_HELP.clientStatus.content}
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
        tooltip={{ enable: true, format: "${point.x}: ${point.y}" }}
        centerLabel={{
          text: `${total}`,
          textStyle: { size: "20px", fontWeight: "600", color: "#e5e5e5" },
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
            innerRadius="60%"
            dataLabel={{
              visible: true,
              position: "Outside",
              name: "x",
              font: { color: "#a3a3a3", size: "11px" },
              connectorStyle: { color: "#525252" },
            }}
          />
        </AccumulationSeriesCollectionDirective>
      </AccumulationChartComponent>
    </div>
  );
}

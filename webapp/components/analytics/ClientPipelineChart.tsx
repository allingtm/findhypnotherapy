"use client";

import {
  AccumulationChartComponent,
  AccumulationSeriesCollectionDirective,
  AccumulationSeriesDirective,
  Inject,
  AccumulationLegend,
  AccumulationTooltip,
  PieSeries,
  AccumulationDataLabel,
} from "@syncfusion/ej2-react-charts";
import { IconUsers } from "@tabler/icons-react";
import type { ClientPipelineData } from "@/app/actions/analytics";

interface ClientPipelineChartProps {
  data: ClientPipelineData[];
}

const statusColors: Record<string, string> = {
  invited: "#3b82f6",
  onboarding: "#eab308",
  active: "#22c55e",
  archived: "#6b7280",
};

const statusLabels: Record<string, string> = {
  invited: "Invited",
  onboarding: "Onboarding",
  active: "Active",
  archived: "Archived",
};

export function ClientPipelineChart({ data }: ClientPipelineChartProps) {
  const total = data.reduce((sum, d) => sum + d.count, 0);

  if (total === 0) {
    return (
      <div className="bg-white dark:bg-neutral-800 rounded-lg border border-gray-200 dark:border-neutral-700 p-4">
        <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">
          Client Pipeline
        </h3>
        <div className="flex flex-col items-center justify-center h-[250px]">
          <IconUsers className="w-12 h-12 text-gray-300 dark:text-gray-600 mb-3" />
          <p className="text-gray-500 dark:text-gray-400 text-sm">No clients yet</p>
        </div>
      </div>
    );
  }

  const chartData = data
    .filter((d) => d.count > 0)
    .map((d) => ({
      x: statusLabels[d.status] || d.status,
      y: d.count,
      fill: statusColors[d.status] || "#6b7280",
    }));

  return (
    <div className="bg-white dark:bg-neutral-800 rounded-lg border border-gray-200 dark:border-neutral-700 p-4">
      <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">
        Client Pipeline
      </h3>
      <AccumulationChartComponent
        height="250px"
        background="transparent"
        legendSettings={{
          visible: true,
          position: "Bottom",
          textStyle: { color: "#a3a3a3" },
        }}
        tooltip={{ enable: true }}
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
            innerRadius="50%"
            dataLabel={{
              visible: true,
              position: "Outside",
              name: "x",
              font: { color: "#a3a3a3", size: "11px" },
            }}
          />
        </AccumulationSeriesCollectionDirective>
      </AccumulationChartComponent>
    </div>
  );
}

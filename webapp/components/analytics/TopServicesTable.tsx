"use client";

import { IconBriefcase } from "@tabler/icons-react";
import type { ServiceBookingData } from "@/app/actions/analytics";

interface TopServicesTableProps {
  data: ServiceBookingData[];
}

export function TopServicesTable({ data }: TopServicesTableProps) {
  if (data.length === 0) {
    return (
      <div className="bg-white dark:bg-neutral-800 rounded-lg border border-gray-200 dark:border-neutral-700 p-4">
        <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">
          Top Services
        </h3>
        <div className="flex flex-col items-center justify-center h-[150px]">
          <IconBriefcase className="w-12 h-12 text-gray-300 dark:text-gray-600 mb-3" />
          <p className="text-gray-500 dark:text-gray-400 text-sm">No service data yet</p>
        </div>
      </div>
    );
  }

  const maxCount = Math.max(...data.map((d) => d.count));

  return (
    <div className="bg-white dark:bg-neutral-800 rounded-lg border border-gray-200 dark:border-neutral-700 p-4">
      <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">
        Top Services
      </h3>
      <div className="space-y-3">
        {data.map((service, idx) => (
          <div key={service.serviceName}>
            <div className="flex items-center justify-between mb-1">
              <span className="text-sm text-gray-700 dark:text-gray-300 truncate flex-1 mr-2">
                <span className="text-gray-400 dark:text-gray-500 mr-2">{idx + 1}.</span>
                {service.serviceName}
              </span>
              <span className="text-sm font-medium text-gray-900 dark:text-white flex-shrink-0">
                {service.count} booking{service.count !== 1 ? "s" : ""}
              </span>
            </div>
            <div className="w-full bg-gray-100 dark:bg-neutral-700 rounded-full h-2">
              <div
                className="h-2 rounded-full bg-blue-500 transition-all"
                style={{
                  width: `${Math.max((service.count / maxCount) * 100, 4)}%`,
                }}
              />
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}

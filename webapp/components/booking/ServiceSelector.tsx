"use client";

import type { ServiceType } from "@/lib/types/database";
import { SERVICE_TYPE_LABELS } from "@/lib/types/services";

export interface ServiceOption {
  id: string;
  name: string;
  service_type: ServiceType;
}

interface ServiceSelectorProps {
  services: ServiceOption[];
  selectedServiceId: string | null;
  onServiceSelect: (serviceId: string | null) => void;
}

export function ServiceSelector({
  services,
  selectedServiceId,
  onServiceSelect,
}: ServiceSelectorProps) {
  return (
    <div className="bg-white dark:bg-neutral-800 rounded-lg border border-gray-200 dark:border-neutral-700 p-4">
      <h3 className="font-medium text-gray-900 dark:text-gray-100 mb-3">
        I&apos;m interested in...
      </h3>

      <div className="flex flex-wrap gap-2">
        {/* General enquiry option */}
        <button
          type="button"
          onClick={() => onServiceSelect(null)}
          className={`px-3 py-1.5 rounded-full text-sm font-medium transition-colors ${
            selectedServiceId === null
              ? "bg-blue-600 text-white"
              : "bg-gray-100 dark:bg-neutral-700 text-gray-700 dark:text-gray-300 hover:bg-gray-200 dark:hover:bg-neutral-600"
          }`}
        >
          General enquiry
        </button>

        {/* Service options as chips */}
        {services.map((service) => {
          const isSelected = selectedServiceId === service.id;

          return (
            <button
              key={service.id}
              type="button"
              onClick={() => onServiceSelect(service.id)}
              className={`px-3 py-1.5 rounded-full text-sm font-medium transition-colors ${
                isSelected
                  ? "bg-blue-600 text-white"
                  : "bg-gray-100 dark:bg-neutral-700 text-gray-700 dark:text-gray-300 hover:bg-gray-200 dark:hover:bg-neutral-600"
              }`}
            >
              {service.name}
            </button>
          );
        })}
      </div>
    </div>
  );
}

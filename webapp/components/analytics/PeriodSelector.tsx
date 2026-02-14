"use client";

import { useRouter, useSearchParams, usePathname } from "next/navigation";
import { cn } from "@/lib/utils";

const periods = [
  { label: "7 days", value: "7" },
  { label: "30 days", value: "30" },
  { label: "90 days", value: "90" },
];

export function PeriodSelector() {
  const router = useRouter();
  const pathname = usePathname();
  const searchParams = useSearchParams();
  const current = searchParams.get("days") || "30";

  const handleChange = (value: string) => {
    const params = new URLSearchParams(searchParams.toString());
    params.set("days", value);
    router.push(`${pathname}?${params.toString()}`);
  };

  return (
    <div className="inline-flex rounded-lg border border-gray-200 dark:border-neutral-700 p-0.5 bg-gray-50 dark:bg-neutral-800">
      {periods.map((p) => (
        <button
          key={p.value}
          onClick={() => handleChange(p.value)}
          className={cn(
            "px-3 py-1.5 text-sm font-medium rounded-md transition-colors",
            current === p.value
              ? "bg-white dark:bg-neutral-700 text-gray-900 dark:text-white shadow-sm"
              : "text-gray-500 dark:text-gray-400 hover:text-gray-700 dark:hover:text-gray-300"
          )}
        >
          {p.label}
        </button>
      ))}
    </div>
  );
}

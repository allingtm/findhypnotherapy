"use client";

import Link from "next/link";
import { cn } from "@/lib/utils";

interface StatCardProps {
  title: string;
  value: number | string;
  icon: React.ReactNode;
  linkHref?: string;
  linkText?: string;
  variant?: "default" | "warning" | "success" | "info" | "purple";
  subtitle?: string;
}

const variantStyles = {
  default: "border-t-blue-500",
  warning: "border-t-amber-500",
  success: "border-t-green-500",
  info: "border-t-cyan-500",
  purple: "border-t-purple-500",
};

export function StatCard({
  title,
  value,
  icon,
  linkHref,
  linkText,
  variant = "default",
  subtitle,
}: StatCardProps) {
  const content = (
    <div
      className={cn(
        "bg-white dark:bg-neutral-800 rounded-lg border border-gray-200 dark:border-neutral-700 p-4 sm:p-5 border-t-4 transition-shadow hover:shadow-md",
        variantStyles[variant]
      )}
    >
      <div className="flex items-start justify-between">
        <div className="flex-1 min-w-0">
          <p className="text-sm font-medium text-gray-500 dark:text-gray-400 truncate">
            {title}
          </p>
          <p className="mt-1 text-2xl sm:text-3xl font-bold text-gray-900 dark:text-white">
            {value}
          </p>
          {subtitle && (
            <p className="mt-1 text-xs text-gray-500 dark:text-gray-400">
              {subtitle}
            </p>
          )}
        </div>
        <div className="flex-shrink-0 ml-3">
          <div className="w-10 h-10 sm:w-12 sm:h-12 rounded-full bg-gray-100 dark:bg-neutral-700 flex items-center justify-center text-gray-600 dark:text-gray-300">
            {icon}
          </div>
        </div>
      </div>
      {linkText && (
        <div className="mt-3 pt-3 border-t border-gray-100 dark:border-neutral-700">
          <span className="text-sm font-medium text-blue-600 dark:text-blue-400 hover:text-blue-700 dark:hover:text-blue-300">
            {linkText} &rarr;
          </span>
        </div>
      )}
    </div>
  );

  if (linkHref) {
    return <Link href={linkHref}>{content}</Link>;
  }

  return content;
}

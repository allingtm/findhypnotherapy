"use client";

import { useState } from "react";
import { IconHelpCircle } from "@tabler/icons-react";
import { HelpModal } from "./HelpModal";

interface SectionHeaderProps {
  title: string;
  helpTitle: string;
  helpContent: React.ReactNode;
  icon?: React.ReactNode;
  action?: React.ReactNode;
  className?: string;
}

export function SectionHeader({
  title,
  helpTitle,
  helpContent,
  icon,
  action,
  className = "",
}: SectionHeaderProps) {
  const [isHelpOpen, setIsHelpOpen] = useState(false);

  return (
    <>
      <div className={`flex items-center justify-between ${className}`}>
        <div className="flex items-center gap-2">
          {icon}
          <h2 className="text-lg font-semibold text-gray-900 dark:text-white">
            {title}
          </h2>
          <button
            onClick={() => setIsHelpOpen(true)}
            className="p-1 hover:bg-gray-100 dark:hover:bg-neutral-700 rounded-full transition-colors"
            aria-label={`Help: ${title}`}
          >
            <IconHelpCircle className="w-4 h-4 text-gray-400 dark:text-gray-500 hover:text-blue-500 dark:hover:text-blue-400" />
          </button>
        </div>
        {action}
      </div>

      <HelpModal
        isOpen={isHelpOpen}
        onClose={() => setIsHelpOpen(false)}
        title={helpTitle}
      >
        {helpContent}
      </HelpModal>
    </>
  );
}

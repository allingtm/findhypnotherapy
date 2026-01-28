"use client";

import { useState } from "react";
import { IconChevronDown, IconChevronUp } from "@tabler/icons-react";

interface Terms {
  id: string | null;
  title: string;
  content: string;
}

interface TermsAcceptanceProps {
  terms: Terms;
  accepted: boolean;
  onAcceptChange: (accepted: boolean, termsId: string | null) => void;
  disabled?: boolean;
}

export function TermsAcceptance({
  terms,
  accepted,
  onAcceptChange,
  disabled = false,
}: TermsAcceptanceProps) {
  const [showFullTerms, setShowFullTerms] = useState(false);

  if (!terms.content) {
    return null;
  }

  return (
    <div className="border border-gray-200 dark:border-neutral-700 rounded-lg p-4">
      <h4 className="font-medium text-gray-900 dark:text-white mb-3">
        {terms.title || "Terms & Conditions"}
      </h4>

      {/* Collapsed preview */}
      {!showFullTerms && (
        <div className="text-sm text-gray-600 dark:text-gray-400 mb-3">
          <p className="line-clamp-3">
            {terms.content.substring(0, 200)}
            {terms.content.length > 200 && "..."}
          </p>
          <button
            type="button"
            onClick={() => setShowFullTerms(true)}
            className="inline-flex items-center gap-1 text-blue-600 dark:text-blue-400 hover:underline mt-2 text-sm font-medium"
          >
            Read full terms
            <IconChevronDown className="w-4 h-4" />
          </button>
        </div>
      )}

      {/* Expanded terms */}
      {showFullTerms && (
        <div className="mb-4">
          <div className="bg-gray-50 dark:bg-neutral-800/50 rounded-lg p-4 max-h-64 overflow-y-auto">
            <div className="text-sm text-gray-700 dark:text-gray-300 whitespace-pre-wrap">
              {terms.content}
            </div>
          </div>

          <button
            type="button"
            onClick={() => setShowFullTerms(false)}
            className="inline-flex items-center gap-1 text-blue-600 dark:text-blue-400 hover:underline mt-2 text-sm font-medium"
          >
            Collapse
            <IconChevronUp className="w-4 h-4" />
          </button>
        </div>
      )}

      {/* Acceptance checkbox */}
      <label className="flex items-start gap-3 cursor-pointer">
        <input
          type="checkbox"
          checked={accepted}
          onChange={(e) => onAcceptChange(e.target.checked, terms.id)}
          disabled={disabled}
          className="mt-1 w-4 h-4 rounded border-gray-300 dark:border-neutral-600 text-blue-600 focus:ring-blue-500"
        />
        <span className="text-sm text-gray-700 dark:text-gray-300">
          I have read and agree to the{" "}
          <button
            type="button"
            onClick={() => setShowFullTerms(true)}
            className="text-blue-600 dark:text-blue-400 hover:underline"
          >
            Terms & Conditions
          </button>
        </span>
      </label>
    </div>
  );
}

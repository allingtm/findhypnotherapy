"use client";

import { useActionState, useState } from "react";
import { IconBan, IconFlag, IconDotsVertical, IconCheck } from "@tabler/icons-react";

interface BlockReportButtonsProps {
  conversationId: string;
  blockAction: (
    prevState: unknown,
    formData: FormData
  ) => Promise<{ success: boolean; error?: string }>;
  reportAction: (
    prevState: unknown,
    formData: FormData
  ) => Promise<{ success: boolean; error?: string }>;
  isBlocked: boolean;
  isReported: boolean;
}

export function BlockReportButtons({
  conversationId,
  blockAction,
  reportAction,
  isBlocked,
  isReported,
}: BlockReportButtonsProps) {
  const [showMenu, setShowMenu] = useState(false);
  const [showBlockConfirm, setShowBlockConfirm] = useState(false);

  const [blockState, blockFormAction, isBlockPending] = useActionState(blockAction, {
    success: false,
  });
  const [reportState, reportFormAction, isReportPending] = useActionState(
    reportAction,
    { success: false }
  );

  if (isBlocked) {
    return (
      <span className="text-sm text-gray-500 dark:text-gray-400 flex items-center gap-1">
        <IconBan className="w-4 h-4" />
        Blocked
      </span>
    );
  }

  return (
    <div className="relative">
      <button
        onClick={() => setShowMenu(!showMenu)}
        className="p-2 hover:bg-gray-100 dark:hover:bg-gray-700 rounded-full transition-colors"
        aria-label="More options"
      >
        <IconDotsVertical className="w-5 h-5 text-gray-500" />
      </button>

      {showMenu && (
        <>
          {/* Backdrop */}
          <div
            className="fixed inset-0 z-10"
            onClick={() => {
              setShowMenu(false);
              setShowBlockConfirm(false);
            }}
          />

          {/* Menu */}
          <div className="absolute right-0 mt-1 w-48 bg-white dark:bg-gray-800 rounded-lg shadow-lg border border-gray-200 dark:border-gray-700 z-20 overflow-hidden">
            {!showBlockConfirm ? (
              <>
                <button
                  onClick={() => setShowBlockConfirm(true)}
                  className="w-full px-4 py-2.5 text-left text-sm text-red-600 dark:text-red-400 hover:bg-gray-50 dark:hover:bg-gray-700 flex items-center gap-2"
                >
                  <IconBan className="w-4 h-4" />
                  Block visitor
                </button>

                <form action={reportFormAction}>
                  <input type="hidden" name="conversationId" value={conversationId} />
                  <button
                    type="submit"
                    disabled={isReported || isReportPending || reportState.success}
                    className="w-full px-4 py-2.5 text-left text-sm text-gray-700 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-gray-700 flex items-center gap-2 disabled:opacity-50"
                  >
                    {reportState.success || isReported ? (
                      <>
                        <IconCheck className="w-4 h-4 text-green-600" />
                        Reported
                      </>
                    ) : (
                      <>
                        <IconFlag className="w-4 h-4" />
                        {isReportPending ? "Reporting..." : "Report as spam"}
                      </>
                    )}
                  </button>
                </form>
              </>
            ) : (
              <div className="p-3">
                <p className="text-sm text-gray-700 dark:text-gray-300 mb-3">
                  Block this visitor? They won&apos;t be able to message you again.
                </p>
                <div className="flex gap-2">
                  <button
                    onClick={() => setShowBlockConfirm(false)}
                    className="flex-1 px-3 py-1.5 text-sm bg-gray-100 dark:bg-gray-700 text-gray-700 dark:text-gray-300 rounded hover:bg-gray-200 dark:hover:bg-gray-600"
                  >
                    Cancel
                  </button>
                  <form action={blockFormAction} className="flex-1">
                    <input type="hidden" name="conversationId" value={conversationId} />
                    <button
                      type="submit"
                      disabled={isBlockPending}
                      className="w-full px-3 py-1.5 text-sm bg-red-600 text-white rounded hover:bg-red-700 disabled:opacity-50"
                    >
                      {isBlockPending ? "..." : "Block"}
                    </button>
                  </form>
                </div>
                {blockState.error && (
                  <p className="mt-2 text-xs text-red-600">{blockState.error}</p>
                )}
              </div>
            )}
          </div>
        </>
      )}
    </div>
  );
}

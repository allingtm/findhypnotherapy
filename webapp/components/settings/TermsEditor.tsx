"use client";

import React, { useState, useEffect, useActionState } from "react";
import { Button } from "@/components/ui/Button";
import { Input } from "@/components/ui/Input";
import { Alert } from "@/components/ui/Alert";
import {
  getActiveTermsAction,
  createTermsAction,
  updateTermsAction,
  getTermsAcceptanceStatsAction,
} from "@/app/actions/therapist-terms";
import { IconFileText, IconEye, IconHistory, IconUsers } from "@tabler/icons-react";

interface TermsData {
  id: string;
  version: string;
  title: string;
  content: string;
  is_active: boolean;
  created_at: string;
}

interface AcceptanceStats {
  acceptanceCount: number;
  clients: Array<{ name: string; email: string; acceptedAt: string }>;
}

type FormState = {
  success: boolean;
  error?: string;
  fieldErrors?: Record<string, string[]>;
  data?: Record<string, unknown>;
};

const initialState: FormState = {
  success: false,
};

export function TermsEditor() {
  const [activeTerms, setActiveTerms] = useState<TermsData | null>(null);
  const [title, setTitle] = useState("Terms & Conditions");
  const [content, setContent] = useState("");
  const [isLoading, setIsLoading] = useState(true);
  const [isSaving, setIsSaving] = useState(false);
  const [showPreview, setShowPreview] = useState(false);
  const [showStats, setShowStats] = useState(false);
  const [acceptanceStats, setAcceptanceStats] = useState<AcceptanceStats | null>(null);
  const [successMessage, setSuccessMessage] = useState<string | null>(null);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);

  // Load active terms on mount
  useEffect(() => {
    async function loadTerms() {
      try {
        const result = await getActiveTermsAction();
        if (result.success && result.data) {
          const terms = result.data as unknown as TermsData;
          setActiveTerms(terms);
          setTitle(terms.title || "Terms & Conditions");
          setContent(terms.content || "");
        }
      } catch (error) {
        console.error("Error loading terms:", error);
        setErrorMessage("Failed to load terms");
      } finally {
        setIsLoading(false);
      }
    }
    loadTerms();
  }, []);

  // Load acceptance stats when showing stats
  useEffect(() => {
    async function loadStats() {
      if (showStats && activeTerms?.id) {
        try {
          const result = await getTermsAcceptanceStatsAction(activeTerms.id);
          if (result.success && result.data) {
            setAcceptanceStats(result.data);
          }
        } catch (error) {
          console.error("Error loading stats:", error);
        }
      }
    }
    loadStats();
  }, [showStats, activeTerms?.id]);

  const handleSave = async () => {
    setIsSaving(true);
    setSuccessMessage(null);
    setErrorMessage(null);

    try {
      let result: FormState;

      if (activeTerms) {
        // Update existing terms
        result = await updateTermsAction({
          termsId: activeTerms.id,
          title,
          content,
        });
      } else {
        // Create new terms
        result = await createTermsAction({
          title,
          content,
        });
      }

      if (result.success) {
        setSuccessMessage(
          activeTerms
            ? "Terms updated successfully"
            : "Terms created successfully"
        );
        // Reload to get updated data
        const reloadResult = await getActiveTermsAction();
        if (reloadResult.success && reloadResult.data) {
          const terms = reloadResult.data as unknown as TermsData;
          setActiveTerms(terms);
        }
      } else {
        setErrorMessage(
          result.error ||
            Object.values(result.fieldErrors || {})
              .flat()
              .join(", ") ||
            "Failed to save terms"
        );
      }
    } catch (error) {
      console.error("Error saving terms:", error);
      setErrorMessage("An unexpected error occurred");
    } finally {
      setIsSaving(false);
    }
  };

  const hasChanges =
    title !== (activeTerms?.title || "Terms & Conditions") ||
    content !== (activeTerms?.content || "");

  if (isLoading) {
    return (
      <div className="bg-white dark:bg-neutral-800 rounded-lg border border-gray-200 dark:border-neutral-700 p-6">
        <div className="flex items-center gap-2 text-gray-500 dark:text-gray-400">
          <div className="w-5 h-5 border-2 border-gray-300 border-t-transparent rounded-full animate-spin" />
          <span>Loading terms...</span>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-3">
          <div className="p-2 bg-blue-100 dark:bg-blue-900/30 rounded-lg">
            <IconFileText className="w-6 h-6 text-blue-600 dark:text-blue-400" />
          </div>
          <div>
            <h2 className="text-xl font-semibold text-gray-900 dark:text-white">
              Terms & Conditions
            </h2>
            <p className="text-sm text-gray-500 dark:text-gray-400">
              Customize the terms your clients must accept during onboarding
            </p>
          </div>
        </div>
        <div className="flex items-center gap-2">
          {activeTerms && (
            <button
              onClick={() => setShowStats(!showStats)}
              className="flex items-center gap-2 px-3 py-2 text-sm text-gray-600 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-neutral-700 rounded-lg transition-colors"
            >
              <IconUsers className="w-4 h-4" />
              Acceptances
            </button>
          )}
          <button
            onClick={() => setShowPreview(!showPreview)}
            className="flex items-center gap-2 px-3 py-2 text-sm text-gray-600 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-neutral-700 rounded-lg transition-colors"
          >
            <IconEye className="w-4 h-4" />
            {showPreview ? "Edit" : "Preview"}
          </button>
        </div>
      </div>

      {/* Alerts */}
      {successMessage && (
        <Alert
          type="success"
          message={successMessage}
          onDismiss={() => setSuccessMessage(null)}
        />
      )}
      {errorMessage && (
        <Alert
          type="error"
          message={errorMessage}
          onDismiss={() => setErrorMessage(null)}
        />
      )}

      {/* Version info */}
      {activeTerms && (
        <div className="flex items-center gap-4 text-sm text-gray-500 dark:text-gray-400 bg-gray-50 dark:bg-neutral-800/50 rounded-lg p-3">
          <div className="flex items-center gap-1">
            <IconHistory className="w-4 h-4" />
            <span>Version: {activeTerms.version}</span>
          </div>
          <span>|</span>
          <span>
            Last updated:{" "}
            {new Date(activeTerms.created_at).toLocaleDateString("en-GB", {
              day: "numeric",
              month: "long",
              year: "numeric",
            })}
          </span>
        </div>
      )}

      {/* Acceptance Stats */}
      {showStats && acceptanceStats && (
        <div className="bg-gray-50 dark:bg-neutral-800/50 rounded-lg p-4 border border-gray-200 dark:border-neutral-700">
          <h3 className="font-medium text-gray-900 dark:text-white mb-3">
            Client Acceptances ({acceptanceStats.acceptanceCount})
          </h3>
          {acceptanceStats.clients.length > 0 ? (
            <div className="space-y-2 max-h-48 overflow-y-auto">
              {acceptanceStats.clients.map((client, index) => (
                <div
                  key={index}
                  className="flex items-center justify-between text-sm py-2 border-b border-gray-200 dark:border-neutral-700 last:border-0"
                >
                  <div>
                    <span className="font-medium text-gray-900 dark:text-white">
                      {client.name}
                    </span>
                    <span className="text-gray-500 dark:text-gray-400 ml-2">
                      {client.email}
                    </span>
                  </div>
                  <span className="text-gray-500 dark:text-gray-400">
                    {new Date(client.acceptedAt).toLocaleDateString("en-GB")}
                  </span>
                </div>
              ))}
            </div>
          ) : (
            <p className="text-sm text-gray-500 dark:text-gray-400">
              No clients have accepted these terms yet.
            </p>
          )}
        </div>
      )}

      {/* Editor / Preview */}
      <div className="bg-white dark:bg-neutral-800 rounded-lg border border-gray-200 dark:border-neutral-700 p-6">
        {showPreview ? (
          <div className="prose dark:prose-invert max-w-none">
            <h1>{title}</h1>
            <div className="whitespace-pre-wrap">{content || "No content yet..."}</div>
          </div>
        ) : (
          <div className="space-y-4">
            <Input
              label="Title"
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              placeholder="Terms & Conditions"
            />
            <div>
              <label
                htmlFor="terms-content"
                className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1"
              >
                Content
              </label>
              <textarea
                id="terms-content"
                value={content}
                onChange={(e) => setContent(e.target.value)}
                placeholder="Enter your terms and conditions here...

You can include sections like:
- Confidentiality
- Cancellation policy
- Payment terms
- Session guidelines
- Limitations of service
- Data protection"
                rows={20}
                className="w-full px-3 py-2 border rounded-lg bg-white dark:bg-neutral-800 text-gray-900 dark:text-gray-100 border-gray-300 dark:border-neutral-600 focus:outline-none focus:ring-2 focus:ring-blue-500 resize-y"
              />
              <p className="mt-1 text-sm text-gray-500 dark:text-gray-400">
                {content.length} / 50,000 characters
              </p>
            </div>
          </div>
        )}
      </div>

      {/* Actions */}
      {!showPreview && (
        <div className="flex items-center justify-between">
          <p className="text-sm text-gray-500 dark:text-gray-400">
            {hasChanges ? (
              <span className="text-amber-600 dark:text-amber-400">
                You have unsaved changes
              </span>
            ) : (
              "All changes saved"
            )}
          </p>
          <Button
            onClick={handleSave}
            loading={isSaving}
            disabled={!hasChanges || !content.trim()}
          >
            {activeTerms ? "Save Changes" : "Create Terms"}
          </Button>
        </div>
      )}

      {/* Help text */}
      <div className="bg-blue-50 dark:bg-blue-900/20 border border-blue-200 dark:border-blue-800 rounded-lg p-4">
        <h3 className="font-medium text-blue-900 dark:text-blue-300 mb-2">
          About Terms & Conditions
        </h3>
        <ul className="text-sm text-blue-800 dark:text-blue-300 space-y-1 list-disc list-inside">
          <li>Clients must accept your terms during the onboarding and booking process</li>
          <li>Each acceptance is recorded with a timestamp for compliance</li>
          <li>
            If you update your terms after clients have accepted, a new version
            will be created
          </li>
          <li>
            These are your default terms - they apply to all services unless overridden
          </li>
          <li>
            Services can have their own terms that replace these during booking
          </li>
        </ul>
      </div>
    </div>
  );
}

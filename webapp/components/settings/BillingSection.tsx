"use client";

import { useState } from "react";
import { Button } from "@/components/ui/Button";
import { createBillingPortalSession } from "@/app/actions/stripe";
import {
  IconCreditCard,
  IconCalendar,
  IconCheck,
  IconLoader2,
} from "@tabler/icons-react";

interface Subscription {
  id: string;
  status: string;
  plan_name: string | null;
  current_period_end: string | null;
  trial_end: string | null;
}

interface BillingSectionProps {
  subscription: Subscription | null;
}

export function BillingSection({ subscription }: BillingSectionProps) {
  const [isLoading, setIsLoading] = useState(false);

  const handleManageBilling = async () => {
    setIsLoading(true);
    try {
      // This action calls redirect() internally, so no return value
      await createBillingPortalSession();
    } catch (error) {
      // redirect() throws a special error - only log actual errors
      if (error instanceof Error && !error.message.includes("NEXT_REDIRECT")) {
        console.error("Failed to open billing portal:", error);
      }
    } finally {
      setIsLoading(false);
    }
  };

  const formatDate = (dateString: string | null) => {
    if (!dateString) return "N/A";
    return new Date(dateString).toLocaleDateString("en-GB", {
      day: "numeric",
      month: "long",
      year: "numeric",
    });
  };

  return (
    <div className="space-y-6">
      {/* Current Plan */}
      <div className="bg-white dark:bg-neutral-800 rounded-lg border border-gray-200 dark:border-neutral-700 p-6">
        <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">
          Current Plan
        </h3>

        {subscription ? (
          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-full bg-green-100 dark:bg-green-900/30 flex items-center justify-center">
                  <IconCheck className="w-5 h-5 text-green-600 dark:text-green-400" />
                </div>
                <div>
                  <p className="font-medium text-gray-900 dark:text-white">
                    {subscription.plan_name || "Professional Plan"}
                  </p>
                  <p className="text-sm text-gray-500 dark:text-gray-400 capitalize">
                    {subscription.status === "trialing"
                      ? "Free Trial"
                      : subscription.status}
                  </p>
                </div>
              </div>
              <span
                className={`px-3 py-1 text-sm font-medium rounded-full ${
                  subscription.status === "active" ||
                  subscription.status === "trialing"
                    ? "bg-green-100 text-green-800 dark:bg-green-900/30 dark:text-green-300"
                    : "bg-yellow-100 text-yellow-800 dark:bg-yellow-900/30 dark:text-yellow-300"
                }`}
              >
                {subscription.status === "trialing" ? "Trial" : "Active"}
              </span>
            </div>

            <div className="pt-4 border-t border-gray-100 dark:border-neutral-700 space-y-3">
              {subscription.status === "trialing" && subscription.trial_end && (
                <div className="flex items-center gap-2 text-sm">
                  <IconCalendar className="w-4 h-4 text-gray-400" />
                  <span className="text-gray-600 dark:text-gray-400">
                    Trial ends:{" "}
                    <span className="font-medium text-gray-900 dark:text-white">
                      {formatDate(subscription.trial_end)}
                    </span>
                  </span>
                </div>
              )}

              {subscription.current_period_end && (
                <div className="flex items-center gap-2 text-sm">
                  <IconCalendar className="w-4 h-4 text-gray-400" />
                  <span className="text-gray-600 dark:text-gray-400">
                    {subscription.status === "trialing" ? "Renews" : "Next billing date"}:{" "}
                    <span className="font-medium text-gray-900 dark:text-white">
                      {formatDate(subscription.current_period_end)}
                    </span>
                  </span>
                </div>
              )}
            </div>
          </div>
        ) : (
          <div className="text-center py-6">
            <div className="w-12 h-12 mx-auto mb-3 bg-gray-100 dark:bg-neutral-700 rounded-full flex items-center justify-center">
              <IconCreditCard className="w-6 h-6 text-gray-400" />
            </div>
            <p className="text-gray-600 dark:text-gray-400">
              No active subscription
            </p>
          </div>
        )}
      </div>

      {/* Manage Billing Button */}
      <Button
        onClick={handleManageBilling}
        disabled={isLoading}
        className="w-full flex items-center justify-center gap-2"
      >
        {isLoading ? (
          <IconLoader2 className="w-4 h-4 animate-spin" />
        ) : (
          <IconCreditCard className="w-4 h-4" />
        )}
        {isLoading ? "Opening..." : "Manage Billing"}
      </Button>

      <p className="text-xs text-gray-500 dark:text-gray-400 text-center">
        You will be redirected to our secure billing portal powered by Stripe
      </p>
    </div>
  );
}

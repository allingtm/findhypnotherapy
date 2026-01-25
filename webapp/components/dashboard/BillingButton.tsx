"use client";

import { IconCreditCard } from "@tabler/icons-react";
import { motion } from "framer-motion";
import { createBillingPortalSession } from "@/app/actions/stripe";
import { useState } from "react";

interface BillingButtonProps {
  open: boolean;
  onClick?: () => void;
}

export function BillingButton({ open, onClick }: BillingButtonProps) {
  const [loading, setLoading] = useState(false);

  const handleClick = async () => {
    onClick?.();
    setLoading(true);
    try {
      await createBillingPortalSession();
    } catch (error) {
      // If user has no subscription, the action will throw
      console.error("Billing portal error:", error);
      setLoading(false);
    }
  };

  return (
    <button
      onClick={handleClick}
      disabled={loading}
      className="flex items-center justify-start gap-2 group/sidebar py-2 text-left w-full disabled:opacity-50"
    >
      <IconCreditCard className="text-neutral-700 dark:text-neutral-200 h-5 w-5 flex-shrink-0" />
      <motion.span
        animate={{
          display: open ? "inline-block" : "none",
          opacity: open ? 1 : 0,
        }}
        className="text-neutral-700 dark:text-neutral-200 text-sm group-hover/sidebar:translate-x-1 transition duration-150 whitespace-pre inline-block !p-0 !m-0"
      >
        {loading ? "Loading..." : "Billing"}
      </motion.span>
    </button>
  );
}

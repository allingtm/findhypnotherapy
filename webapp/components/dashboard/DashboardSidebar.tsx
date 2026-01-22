"use client";

import React, { useState } from "react";
import { Sidebar, SidebarBody, SidebarLink } from "@/components/ui/sidebar";
import {
  IconBrandTabler,
  IconUserBolt,
  IconArrowLeft,
} from "@tabler/icons-react";
import Link from "next/link";
import { motion } from "framer-motion";
import { cn } from "@/lib/utils";
import { useRouter, usePathname } from "next/navigation";
import { createClient } from "@/lib/supabase/client";

interface DashboardSidebarProps {
  children: React.ReactNode;
  user: {
    name?: string | null;
    email?: string;
  };
}

export function DashboardSidebar({ children, user }: DashboardSidebarProps) {
  const [open, setOpen] = useState(false);
  const router = useRouter();
  const pathname = usePathname();

  const handleLogout = async () => {
    setOpen(false);
    try {
      const supabase = createClient();
      await supabase.auth.signOut();
      router.push("/");
      router.refresh();
    } catch (error) {
      console.error("Error logging out:", error);
    }
  };

  const handleLinkClick = () => {
    setOpen(false);
  };

  const links = [
    {
      label: "Dashboard",
      href: "/dashboard",
      icon: (
        <IconBrandTabler className="text-neutral-700 dark:text-neutral-200 h-5 w-5 flex-shrink-0" />
      ),
    },
    {
      label: "Profile",
      href: "/dashboard/profile",
      icon: (
        <IconUserBolt className="text-neutral-700 dark:text-neutral-200 h-5 w-5 flex-shrink-0" />
      ),
    },
  ];

  return (
    <div
      className={cn(
        "flex flex-col md:flex-row bg-gray-100 dark:bg-neutral-800 w-full flex-1 mx-auto border border-neutral-200 dark:border-neutral-700 overflow-hidden",
        "h-screen"
      )}
    >
      <Sidebar open={open} setOpen={setOpen}>
        <SidebarBody className="justify-between gap-10">
          <div className="flex flex-col flex-1 overflow-y-auto overflow-x-hidden">
            {open ? <Logo onClick={handleLinkClick} /> : <LogoIcon onClick={handleLinkClick} />}
            <div className="mt-8 flex flex-col gap-2">
              {links.map((link, idx) => (
                <SidebarLink
                  key={idx}
                  link={link}
                  className={cn(
                    pathname === link.href && "bg-neutral-200 dark:bg-neutral-700 rounded-md"
                  )}
                  onClick={handleLinkClick}
                />
              ))}
              <button
                onClick={handleLogout}
                className="flex items-center justify-start gap-2 group/sidebar py-2 text-left"
              >
                <IconArrowLeft className="text-neutral-700 dark:text-neutral-200 h-5 w-5 flex-shrink-0" />
                <motion.span
                  animate={{
                    display: open ? "inline-block" : "none",
                    opacity: open ? 1 : 0,
                  }}
                  className="text-neutral-700 dark:text-neutral-200 text-sm group-hover/sidebar:translate-x-1 transition duration-150 whitespace-pre inline-block !p-0 !m-0"
                >
                  Logout
                </motion.span>
              </button>
            </div>
          </div>
          <div>
            <SidebarLink
              link={{
                label: user.name || user.email || "User",
                href: "/dashboard/profile",
                icon: (
                  <div className="h-7 w-7 flex-shrink-0 rounded-full bg-neutral-200 dark:bg-neutral-700 flex items-center justify-center">
                    <span className="text-xs font-semibold text-neutral-700 dark:text-neutral-200">
                      {(user.name || user.email || "U").charAt(0).toUpperCase()}
                    </span>
                  </div>
                ),
              }}
              onClick={handleLinkClick}
            />
          </div>
        </SidebarBody>
      </Sidebar>
      <div className="flex flex-1">
        <div className="p-2 md:p-10 rounded-tl-2xl border border-neutral-200 dark:border-neutral-700 bg-white dark:bg-neutral-900 flex flex-col gap-2 flex-1 w-full h-full overflow-y-auto">
          {children}
        </div>
      </div>
    </div>
  );
}

export const Logo = ({ onClick }: { onClick?: () => void }) => {
  return (
    <Link
      href="/dashboard"
      className="font-normal flex space-x-2 items-center text-sm text-black py-1 relative z-20"
      onClick={onClick}
    >
      <div className="h-5 w-6 bg-black dark:bg-white rounded-br-lg rounded-tr-sm rounded-tl-lg rounded-bl-sm flex-shrink-0" />
      <motion.span
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        className="font-medium text-black dark:text-white whitespace-pre"
      >
        Find Hypnotherapy
      </motion.span>
    </Link>
  );
};

export const LogoIcon = ({ onClick }: { onClick?: () => void }) => {
  return (
    <Link
      href="/dashboard"
      className="font-normal flex space-x-2 items-center text-sm text-black py-1 relative z-20"
      onClick={onClick}
    >
      <div className="h-5 w-6 bg-black dark:bg-white rounded-br-lg rounded-tr-sm rounded-tl-lg rounded-bl-sm flex-shrink-0" />
    </Link>
  );
};

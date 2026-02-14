"use client";

import React, { useState, useEffect } from "react";
import { Sidebar, SidebarBody, SidebarLink } from "@/components/ui/sidebar";
import {
  IconHome,
  IconArrowLeft,
  IconBriefcase,
  IconCalendar,
  IconUsers,
  IconSettings,
  IconSun,
  IconMoon,
  IconDeviceDesktop,
  IconSparkles,
} from "@tabler/icons-react";
import { BillingButton } from "./BillingButton";
import Link from "next/link";
import { motion } from "framer-motion";
import { cn } from "@/lib/utils";
import { useRouter, usePathname } from "next/navigation";
import { createClient } from "@/lib/supabase/client";
import { useTheme } from "next-themes";

interface DashboardSidebarProps {
  children: React.ReactNode;
  user: {
    name?: string | null;
    email?: string;
  };
}

export function DashboardSidebar({ children, user }: DashboardSidebarProps) {
  const [open, setOpen] = useState(false);
  const [mounted, setMounted] = useState(false);
  const router = useRouter();
  const pathname = usePathname();
  const { theme, setTheme } = useTheme();

  // Avoid hydration mismatch
  useEffect(() => {
    setMounted(true);
  }, []);

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
      label: "Home",
      href: "/dashboard",
      icon: (
        <IconHome className="text-neutral-700 dark:text-neutral-200 h-5 w-5 flex-shrink-0" />
      ),
    },
    {
      label: "Clients",
      href: "/dashboard/clients",
      icon: (
        <IconUsers className="text-neutral-700 dark:text-neutral-200 h-5 w-5 flex-shrink-0" />
      ),
    },
    {
      label: "Schedule",
      href: "/dashboard/schedule",
      icon: (
        <IconCalendar className="text-neutral-700 dark:text-neutral-200 h-5 w-5 flex-shrink-0" />
      ),
    },
    {
      label: "Practice",
      href: "/dashboard/practice",
      icon: (
        <IconBriefcase className="text-neutral-700 dark:text-neutral-200 h-5 w-5 flex-shrink-0" />
      ),
    },
    {
      label: "Settings",
      href: "/dashboard/settings",
      icon: (
        <IconSettings className="text-neutral-700 dark:text-neutral-200 h-5 w-5 flex-shrink-0" />
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
              {links.map((link, idx) => {
                // Check if current path matches this link (exact for Home, startsWith for others)
                const isActive = link.href === "/dashboard"
                  ? pathname === "/dashboard"
                  : pathname.startsWith(link.href);

                return (
                  <SidebarLink
                    key={idx}
                    link={link}
                    className={cn(
                      isActive && "bg-neutral-200 dark:bg-neutral-700 rounded-md"
                    )}
                    onClick={handleLinkClick}
                  />
                );
              })}

              {/* Theme Selector */}
              <div className="py-2">
                {mounted && (
                  <div className="flex items-center gap-1">
                    <button
                      onClick={() => setTheme("light")}
                      className={cn(
                        "p-1.5 rounded-md transition-colors",
                        theme === "light"
                          ? "bg-neutral-200 dark:bg-neutral-700 text-yellow-600"
                          : "text-neutral-500 hover:text-neutral-700 dark:hover:text-neutral-300"
                      )}
                      title="Light mode"
                    >
                      <IconSun className="h-5 w-5" />
                    </button>
                    <button
                      onClick={() => setTheme("dark")}
                      className={cn(
                        "p-1.5 rounded-md transition-colors",
                        theme === "dark"
                          ? "bg-neutral-200 dark:bg-neutral-700 text-blue-400"
                          : "text-neutral-500 hover:text-neutral-700 dark:hover:text-neutral-300"
                      )}
                      title="Dark mode"
                    >
                      <IconMoon className="h-5 w-5" />
                    </button>
                    <button
                      onClick={() => setTheme("system")}
                      className={cn(
                        "p-1.5 rounded-md transition-colors",
                        theme === "system"
                          ? "bg-neutral-200 dark:bg-neutral-700 text-green-500"
                          : "text-neutral-500 hover:text-neutral-700 dark:hover:text-neutral-300"
                      )}
                      title="System theme"
                    >
                      <IconDeviceDesktop className="h-5 w-5" />
                    </button>
                    <motion.span
                      animate={{
                        display: open ? "inline-block" : "none",
                        opacity: open ? 1 : 0,
                      }}
                      className="text-neutral-500 dark:text-neutral-400 text-xs ml-1 whitespace-pre inline-block !p-0 !m-0"
                    >
                      Theme
                    </motion.span>
                  </div>
                )}
              </div>
            </div>
          </div>
          <div>
            <SidebarLink
              link={{
                label: user.name || user.email || "User",
                href: "/dashboard/settings?tab=account",
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
            <BillingButton open={open} onClick={handleLinkClick} />
            <button
              onClick={handleLogout}
              className="flex items-center justify-start gap-2 group/sidebar py-2 text-left w-full"
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
        </SidebarBody>
      </Sidebar>
      <div className="flex flex-1 min-h-0 min-w-0">
        <div className="p-2 md:p-10 rounded-tl-2xl border border-neutral-200 dark:border-neutral-700 bg-white dark:bg-neutral-900 flex flex-col gap-2 flex-1 w-full min-h-0 min-w-0 overflow-y-auto overflow-x-hidden">
          {children}
        </div>
      </div>
    </div>
  );
}

export const Logo = ({ onClick }: { onClick?: () => void }) => {
  return (
    <Link
      href="/"
      className="font-normal flex space-x-2 items-center text-sm text-black py-1 relative z-20"
      onClick={onClick}
    >
      <IconSparkles size={24} className="text-purple-600 dark:text-purple-400 flex-shrink-0" />
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
      href="/"
      className="font-normal flex space-x-2 items-center text-sm text-black py-1 relative z-20"
      onClick={onClick}
    >
      <IconSparkles size={24} className="text-purple-600 dark:text-purple-400 flex-shrink-0" />
    </Link>
  );
};

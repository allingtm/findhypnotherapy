"use client";

import { useState, useEffect, useCallback } from "react";
import { ClientCard } from "./ClientCard";
import { InviteClientDialog } from "./InviteClientDialog";
import { getClientsForMemberAction } from "@/app/actions/clients";
import {
  IconSearch,
  IconPlus,
  IconFilter,
  IconUsers,
  IconUserCheck,
  IconClock,
  IconArchive,
} from "@tabler/icons-react";
import { Button } from "@/components/ui/Button";

type ClientStatus = "all" | "invited" | "active" | "archived";

interface Client {
  id: string;
  slug: string;
  email: string;
  first_name: string | null;
  last_name: string | null;
  status: string;
  created_at: string;
  onboarded_at: string | null;
  session_count?: number;
  last_session_date?: string | null;
}

export function ClientList() {
  const [clients, setClients] = useState<Client[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState("");
  const [statusFilter, setStatusFilter] = useState<ClientStatus>("all");
  const [showInviteDialog, setShowInviteDialog] = useState(false);
  const [counts, setCounts] = useState({
    total: 0,
    invited: 0,
    active: 0,
    archived: 0,
  });

  const loadClients = useCallback(async () => {
    setIsLoading(true);
    try {
      const result = await getClientsForMemberAction({
        status: statusFilter === "all" ? undefined : statusFilter,
        search: searchQuery || undefined,
      });

      if (result.success && result.data) {
        setClients(result.data.clients as unknown as Client[]);
        setCounts(result.data.counts);
      }
    } catch (error) {
      console.error("Failed to load clients:", error);
    } finally {
      setIsLoading(false);
    }
  }, [statusFilter, searchQuery]);

  useEffect(() => {
    loadClients();
  }, [loadClients]);

  // Debounce search
  useEffect(() => {
    const timer = setTimeout(() => {
      loadClients();
    }, 300);
    return () => clearTimeout(timer);
  }, [searchQuery, loadClients]);

  const filterButtons = [
    {
      key: "all" as const,
      label: "All",
      count: counts.total,
      icon: IconUsers,
    },
    {
      key: "active" as const,
      label: "Active",
      count: counts.active,
      icon: IconUserCheck,
    },
    {
      key: "invited" as const,
      label: "Invited",
      count: counts.invited,
      icon: IconClock,
    },
    {
      key: "archived" as const,
      label: "Archived",
      count: counts.archived,
      icon: IconArchive,
    },
  ];

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-gray-900 dark:text-white">
            Clients
          </h1>
          <p className="text-gray-600 dark:text-gray-400 mt-1">
            Manage your client relationships and sessions
          </p>
        </div>
        <Button onClick={() => setShowInviteDialog(true)}>
          <IconPlus className="w-4 h-4 mr-2" />
          Invite Client
        </Button>
      </div>

      {/* Filters */}
      <div className="flex flex-col sm:flex-row gap-4">
        {/* Search */}
        <div className="relative flex-1 max-w-md">
          <IconSearch className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
          <input
            type="text"
            placeholder="Search by name or email..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full pl-10 pr-4 py-2 border rounded-lg bg-white dark:bg-neutral-800 text-gray-900 dark:text-gray-100 border-gray-300 dark:border-neutral-600 focus:outline-none focus:ring-2 focus:ring-blue-500"
          />
        </div>

        {/* Status Filter */}
        <div className="flex items-center gap-2 overflow-x-auto pb-2 sm:pb-0">
          {filterButtons.map((filter) => (
            <button
              key={filter.key}
              onClick={() => setStatusFilter(filter.key)}
              className={`flex items-center gap-2 px-3 py-2 rounded-lg text-sm font-medium whitespace-nowrap transition-colors ${
                statusFilter === filter.key
                  ? "bg-blue-100 text-blue-700 dark:bg-blue-900/30 dark:text-blue-300"
                  : "bg-gray-100 text-gray-600 hover:bg-gray-200 dark:bg-neutral-800 dark:text-gray-400 dark:hover:bg-neutral-700"
              }`}
            >
              <filter.icon className="w-4 h-4" />
              {filter.label}
              <span
                className={`px-1.5 py-0.5 rounded text-xs ${
                  statusFilter === filter.key
                    ? "bg-blue-200 dark:bg-blue-800"
                    : "bg-gray-200 dark:bg-neutral-700"
                }`}
              >
                {filter.count}
              </span>
            </button>
          ))}
        </div>
      </div>

      {/* Client Grid */}
      {isLoading ? (
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {[...Array(6)].map((_, i) => (
            <div
              key={i}
              className="bg-white dark:bg-neutral-800 rounded-lg border border-gray-200 dark:border-neutral-700 p-4 animate-pulse"
            >
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-full bg-gray-200 dark:bg-neutral-700" />
                <div className="flex-1">
                  <div className="h-4 bg-gray-200 dark:bg-neutral-700 rounded w-24 mb-2" />
                  <div className="h-3 bg-gray-200 dark:bg-neutral-700 rounded w-32" />
                </div>
              </div>
            </div>
          ))}
        </div>
      ) : clients.length === 0 ? (
        <div className="text-center py-12 bg-white dark:bg-neutral-800 rounded-lg border border-gray-200 dark:border-neutral-700">
          <IconUsers className="w-12 h-12 mx-auto text-gray-400 dark:text-gray-500 mb-4" />
          <h3 className="text-lg font-medium text-gray-900 dark:text-white mb-2">
            {searchQuery || statusFilter !== "all"
              ? "No clients found"
              : "No clients yet"}
          </h3>
          <p className="text-gray-500 dark:text-gray-400 mb-6 max-w-sm mx-auto">
            {searchQuery || statusFilter !== "all"
              ? "Try adjusting your search or filters"
              : "Invite your first client to get started with managing their sessions and information."}
          </p>
          {!searchQuery && statusFilter === "all" && (
            <Button onClick={() => setShowInviteDialog(true)}>
              <IconPlus className="w-4 h-4 mr-2" />
              Invite Your First Client
            </Button>
          )}
        </div>
      ) : (
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {clients.map((client) => (
            <ClientCard
              key={client.id}
              client={client}
              onUpdate={loadClients}
            />
          ))}
        </div>
      )}

      {/* Invite Dialog */}
      <InviteClientDialog
        isOpen={showInviteDialog}
        onClose={() => setShowInviteDialog(false)}
        onSuccess={loadClients}
      />
    </div>
  );
}

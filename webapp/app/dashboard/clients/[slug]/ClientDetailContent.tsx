"use client";

import { useState, useCallback } from "react";
import { useRouter } from "next/navigation";
import { ClientHeader } from "@/components/clients/ClientHeader";
import { ClientDetailTabs } from "@/components/clients/ClientDetailTabs";
import { ClientInfoCard } from "@/components/clients/ClientInfoCard";
import { EditClientDialog } from "@/components/clients/EditClientDialog";
import { ClientSessionsList } from "@/components/clients/ClientSessionsList";
import { ClientNotesList } from "@/components/clients/ClientNotesList";
import { ClientMessages } from "@/components/clients/ClientMessages";
import { getClientBySlugAction } from "@/app/actions/clients";
import { IconCalendarEvent, IconNotes, IconUser } from "@tabler/icons-react";

interface ClientDetailContentProps {
  client: Record<string, unknown>;
  initialTab: string;
}

export function ClientDetailContent({
  client: initialClient,
  initialTab,
}: ClientDetailContentProps) {
  const router = useRouter();
  const [client, setClient] = useState(initialClient);
  const [activeTab, setActiveTab] = useState(initialTab);
  const [showAddSession, setShowAddSession] = useState(false);
  const [showEditClient, setShowEditClient] = useState(false);

  const clientData = client as unknown as {
    id: string;
    slug: string;
    email: string;
    first_name: string | null;
    last_name: string | null;
    phone: string | null;
    status: string;
    onboarded_at: string | null;
    client_account_id: string | null;
    address_line1: string | null;
    address_line2: string | null;
    city: string | null;
    postal_code: string | null;
    country: string | null;
    emergency_contact_name: string | null;
    emergency_contact_phone: string | null;
    emergency_contact_relationship: string | null;
    health_conditions: string | null;
    medications: string | null;
    allergies: string | null;
    gp_name: string | null;
    gp_practice: string | null;
    client_sessions: Array<{
      id: string;
      title: string;
      session_date: string;
      start_time: string;
      end_time: string;
      status: string;
      session_format: string | null;
      location: string | null;
      meeting_url: string | null;
      therapist_notes: string | null;
      created_at: string;
    }>;
    client_notes: Array<{
      id: string;
      note_type: string;
      content: string;
      is_private: boolean;
      created_at: string;
      session_id: string | null;
    }>;
    client_terms_acceptance: Array<{
      id: string;
      accepted_at: string;
      therapist_terms: {
        title: string;
        version: string;
      };
    }>;
  };

  const reloadClient = useCallback(async () => {
    const result = await getClientBySlugAction(clientData.slug);
    if (result.success && result.data) {
      setClient(result.data);
    }
    router.refresh();
  }, [clientData.slug, router]);

  const handleTabChange = (tabId: string) => {
    setActiveTab(tabId);
    // Update URL without navigation
    const url = new URL(window.location.href);
    url.searchParams.set("tab", tabId);
    window.history.replaceState({}, "", url.toString());
  };

  const handleAddSession = () => {
    setShowAddSession(true);
    setActiveTab("sessions");
  };

  return (
    <div className="max-w-5xl space-y-6">
      {/* Header */}
      <ClientHeader
        client={clientData}
        onUpdate={reloadClient}
        onAddSession={handleAddSession}
      />

      {/* Tabs */}
      <ClientDetailTabs activeTab={activeTab} onTabChange={handleTabChange} />

      {/* Tab Content */}
      <div className="min-h-[400px]">
        {activeTab === "sessions" && (
          <ClientSessionsList
            clientId={clientData.id}
            clientName={`${clientData.first_name || ""} ${clientData.last_name || ""}`.trim() || "Client"}
            sessions={clientData.client_sessions || []}
            onUpdate={reloadClient}
            showAddDialog={showAddSession}
            onCloseAddDialog={() => setShowAddSession(false)}
          />
        )}

        {activeTab === "messages" && (
          <ClientMessages
            clientId={clientData.id}
            clientName={`${clientData.first_name || ""} ${clientData.last_name || ""}`.trim() || "Client"}
            clientEmail={clientData.email}
          />
        )}

        {activeTab === "notes" && (
          <ClientNotesList
            clientId={clientData.id}
            notes={clientData.client_notes || []}
            sessions={clientData.client_sessions || []}
            onUpdate={reloadClient}
          />
        )}

        {activeTab === "details" && (
          <ClientInfoCard
            client={clientData}
            onEdit={() => setShowEditClient(true)}
          />
        )}
      </div>

      {/* Edit Client Dialog */}
      <EditClientDialog
        isOpen={showEditClient}
        onClose={() => setShowEditClient(false)}
        onSuccess={reloadClient}
        client={clientData}
      />
    </div>
  );
}

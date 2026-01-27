"use client";

import { useState } from "react";
import {
  IconUser,
  IconPhone,
  IconMail,
  IconHome,
  IconAlertTriangle,
  IconHeart,
  IconEdit,
  IconChevronDown,
} from "@tabler/icons-react";

interface ClientInfoCardProps {
  client: {
    id: string;
    email: string;
    first_name: string | null;
    last_name: string | null;
    phone: string | null;
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
  };
  onEdit?: () => void;
}

interface CollapsibleProps {
  title: string;
  icon: React.ReactNode;
  defaultOpen?: boolean;
  children: React.ReactNode;
}

function Collapsible({ title, icon, defaultOpen = false, children }: CollapsibleProps) {
  const [isOpen, setIsOpen] = useState(defaultOpen);

  return (
    <div className="bg-white dark:bg-neutral-800 rounded-lg border border-gray-200 dark:border-neutral-700 overflow-hidden">
      <button
        onClick={() => setIsOpen(!isOpen)}
        className="w-full px-4 py-3 flex items-center justify-between hover:bg-gray-50 dark:hover:bg-neutral-700/50 transition-colors"
      >
        <div className="flex items-center gap-2">
          {icon}
          <h3 className="font-semibold text-gray-900 dark:text-white">{title}</h3>
        </div>
        <IconChevronDown
          className={`w-5 h-5 text-gray-500 transition-transform ${
            isOpen ? "rotate-180" : ""
          }`}
        />
      </button>
      {isOpen && (
        <div className="px-4 pb-4 border-t border-gray-200 dark:border-neutral-700 pt-4">
          {children}
        </div>
      )}
    </div>
  );
}

export function ClientInfoCard({ client, onEdit }: ClientInfoCardProps) {
  const hasAddress =
    client.address_line1 || client.city || client.postal_code;

  const hasHealthInfo =
    client.health_conditions ||
    client.medications ||
    client.allergies ||
    client.gp_name ||
    client.gp_practice;

  return (
    <div className="space-y-4">
      {/* Personal Information */}
      <div className="bg-white dark:bg-neutral-800 rounded-lg border border-gray-200 dark:border-neutral-700">
        <div className="px-4 py-3 border-b border-gray-200 dark:border-neutral-700 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <IconUser className="w-5 h-5 text-blue-600 dark:text-blue-400" />
            <h3 className="font-semibold text-gray-900 dark:text-white">
              Personal Information
            </h3>
          </div>
          {onEdit && (
            <button
              onClick={onEdit}
              className="p-1.5 hover:bg-gray-100 dark:hover:bg-neutral-700 rounded transition-colors"
            >
              <IconEdit className="w-4 h-4 text-gray-500 dark:text-gray-400" />
            </button>
          )}
        </div>
        <div className="p-4 space-y-3">
          <InfoRow
            icon={IconUser}
            label="Name"
            value={
              `${client.first_name || ""} ${client.last_name || ""}`.trim() ||
              "Not provided"
            }
          />
          <InfoRow icon={IconMail} label="Email" value={client.email} />
          <InfoRow
            icon={IconPhone}
            label="Phone"
            value={client.phone || "Not provided"}
          />
        </div>
      </div>

      {/* Address */}
      <Collapsible
        title="Address"
        icon={<IconHome className="w-5 h-5 text-green-600 dark:text-green-400" />}
        defaultOpen={!!hasAddress}
      >
        {hasAddress ? (
          <div className="text-gray-700 dark:text-gray-300">
            {client.address_line1 && <p>{client.address_line1}</p>}
            {client.address_line2 && <p>{client.address_line2}</p>}
            {(client.city || client.postal_code) && (
              <p>
                {client.city}
                {client.city && client.postal_code && ", "}
                {client.postal_code}
              </p>
            )}
            {client.country && <p>{client.country}</p>}
          </div>
        ) : (
          <p className="text-gray-500 dark:text-gray-400 italic">
            No address provided
          </p>
        )}
      </Collapsible>

      {/* Emergency Contact */}
      <Collapsible
        title="Emergency Contact"
        icon={
          <IconAlertTriangle className="w-5 h-5 text-amber-600 dark:text-amber-400" />
        }
        defaultOpen={true}
      >
        {client.emergency_contact_name ? (
          <div className="space-y-2">
            <p className="font-medium text-gray-900 dark:text-white">
              {client.emergency_contact_name}
              {client.emergency_contact_relationship && (
                <span className="text-gray-500 dark:text-gray-400 font-normal ml-2">
                  ({client.emergency_contact_relationship})
                </span>
              )}
            </p>
            {client.emergency_contact_phone && (
              <p className="text-gray-700 dark:text-gray-300">
                {client.emergency_contact_phone}
              </p>
            )}
          </div>
        ) : (
          <p className="text-gray-500 dark:text-gray-400 italic">
            No emergency contact provided
          </p>
        )}
      </Collapsible>

      {/* Health Information */}
      <Collapsible
        title="Health Information"
        icon={<IconHeart className="w-5 h-5 text-red-600 dark:text-red-400" />}
        defaultOpen={!!hasHealthInfo}
      >
        {hasHealthInfo ? (
          <div className="space-y-4">
            {client.health_conditions && (
              <div>
                <h4 className="text-sm font-medium text-gray-500 dark:text-gray-400 mb-1">
                  Health Conditions
                </h4>
                <p className="text-gray-700 dark:text-gray-300 whitespace-pre-wrap">
                  {client.health_conditions}
                </p>
              </div>
            )}
            {client.medications && (
              <div>
                <h4 className="text-sm font-medium text-gray-500 dark:text-gray-400 mb-1">
                  Medications
                </h4>
                <p className="text-gray-700 dark:text-gray-300 whitespace-pre-wrap">
                  {client.medications}
                </p>
              </div>
            )}
            {client.allergies && (
              <div>
                <h4 className="text-sm font-medium text-gray-500 dark:text-gray-400 mb-1">
                  Allergies
                </h4>
                <p className="text-gray-700 dark:text-gray-300">
                  {client.allergies}
                </p>
              </div>
            )}
            {(client.gp_name || client.gp_practice) && (
              <div>
                <h4 className="text-sm font-medium text-gray-500 dark:text-gray-400 mb-1">
                  GP / Doctor
                </h4>
                <p className="text-gray-700 dark:text-gray-300">
                  {client.gp_name}
                  {client.gp_name && client.gp_practice && " at "}
                  {client.gp_practice}
                </p>
              </div>
            )}
          </div>
        ) : (
          <p className="text-gray-500 dark:text-gray-400 italic">
            No health information provided
          </p>
        )}
      </Collapsible>
    </div>
  );
}

function InfoRow({
  icon: Icon,
  label,
  value,
}: {
  icon: React.ComponentType<{ className?: string }>;
  label: string;
  value: string;
}) {
  return (
    <div className="flex items-center gap-3">
      <Icon className="w-4 h-4 text-gray-400" />
      <span className="text-sm text-gray-500 dark:text-gray-400 w-20">
        {label}
      </span>
      <span className="text-gray-900 dark:text-white">{value}</span>
    </div>
  );
}

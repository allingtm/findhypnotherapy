"use client";

import { useState, useEffect } from "react";
import { Button } from "@/components/ui/Button";
import { Input } from "@/components/ui/Input";
import { Alert } from "@/components/ui/Alert";
import { updateClientAction } from "@/app/actions/clients";
import { clientUpdateSchema } from "@/lib/validation/clients";
import {
  IconX,
  IconUser,
  IconChevronDown,
  IconHome,
  IconAlertTriangle,
  IconHeart,
} from "@tabler/icons-react";

interface EditClientDialogProps {
  isOpen: boolean;
  onClose: () => void;
  onSuccess: () => void;
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
}

interface CollapsibleSectionProps {
  title: string;
  icon: React.ReactNode;
  defaultOpen?: boolean;
  children: React.ReactNode;
}

function CollapsibleSection({
  title,
  icon,
  defaultOpen = false,
  children,
}: CollapsibleSectionProps) {
  const [isOpen, setIsOpen] = useState(defaultOpen);

  return (
    <div className="border border-gray-200 dark:border-neutral-700 rounded-lg overflow-hidden">
      <button
        type="button"
        onClick={() => setIsOpen(!isOpen)}
        className="w-full px-4 py-3 flex items-center justify-between hover:bg-gray-50 dark:hover:bg-neutral-700/50 transition-colors"
      >
        <div className="flex items-center gap-2">
          {icon}
          <span className="font-medium text-gray-900 dark:text-white">
            {title}
          </span>
        </div>
        <IconChevronDown
          className={`w-5 h-5 text-gray-500 transition-transform ${
            isOpen ? "rotate-180" : ""
          }`}
        />
      </button>
      {isOpen && (
        <div className="px-4 pb-4 border-t border-gray-200 dark:border-neutral-700 pt-4 space-y-4">
          {children}
        </div>
      )}
    </div>
  );
}

export function EditClientDialog({
  isOpen,
  onClose,
  onSuccess,
  client,
}: EditClientDialogProps) {
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [fieldErrors, setFieldErrors] = useState<Record<string, string[]>>({});

  // Personal info
  const [firstName, setFirstName] = useState(client.first_name || "");
  const [lastName, setLastName] = useState(client.last_name || "");
  const [email, setEmail] = useState(client.email);
  const [phone, setPhone] = useState(client.phone || "");

  // Address
  const [addressLine1, setAddressLine1] = useState(client.address_line1 || "");
  const [addressLine2, setAddressLine2] = useState(client.address_line2 || "");
  const [city, setCity] = useState(client.city || "");
  const [postalCode, setPostalCode] = useState(client.postal_code || "");
  const [country, setCountry] = useState(client.country || "United Kingdom");

  // Emergency contact
  const [emergencyContactName, setEmergencyContactName] = useState(
    client.emergency_contact_name || ""
  );
  const [emergencyContactPhone, setEmergencyContactPhone] = useState(
    client.emergency_contact_phone || ""
  );
  const [emergencyContactRelationship, setEmergencyContactRelationship] =
    useState(client.emergency_contact_relationship || "");

  // Health info
  const [healthConditions, setHealthConditions] = useState(
    client.health_conditions || ""
  );
  const [medications, setMedications] = useState(client.medications || "");
  const [allergies, setAllergies] = useState(client.allergies || "");
  const [gpName, setGpName] = useState(client.gp_name || "");
  const [gpPractice, setGpPractice] = useState(client.gp_practice || "");

  // Reset form when client changes
  useEffect(() => {
    if (isOpen) {
      setFirstName(client.first_name || "");
      setLastName(client.last_name || "");
      setEmail(client.email);
      setPhone(client.phone || "");
      setAddressLine1(client.address_line1 || "");
      setAddressLine2(client.address_line2 || "");
      setCity(client.city || "");
      setPostalCode(client.postal_code || "");
      setCountry(client.country || "United Kingdom");
      setEmergencyContactName(client.emergency_contact_name || "");
      setEmergencyContactPhone(client.emergency_contact_phone || "");
      setEmergencyContactRelationship(
        client.emergency_contact_relationship || ""
      );
      setHealthConditions(client.health_conditions || "");
      setMedications(client.medications || "");
      setAllergies(client.allergies || "");
      setGpName(client.gp_name || "");
      setGpPractice(client.gp_practice || "");
      setError(null);
      setFieldErrors({});
    }
  }, [isOpen, client]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    setFieldErrors({});

    const formData = {
      clientId: client.id,
      firstName: firstName || undefined,
      lastName: lastName || undefined,
      email: email || undefined,
      phone: phone || null,
      addressLine1: addressLine1 || null,
      addressLine2: addressLine2 || null,
      city: city || null,
      postalCode: postalCode || null,
      country: country || null,
      emergencyContactName: emergencyContactName || null,
      emergencyContactPhone: emergencyContactPhone || null,
      emergencyContactRelationship: emergencyContactRelationship || null,
      healthConditions: healthConditions || null,
      medications: medications || null,
      allergies: allergies || null,
      gpName: gpName || null,
      gpPractice: gpPractice || null,
    };

    // Client-side validation
    const validation = clientUpdateSchema.safeParse(formData);
    if (!validation.success) {
      const errors: Record<string, string[]> = {};
      validation.error.issues.forEach((issue) => {
        const field = issue.path[0]?.toString();
        if (field) {
          if (!errors[field]) errors[field] = [];
          errors[field].push(issue.message);
        }
      });
      setFieldErrors(errors);
      return;
    }

    setIsSubmitting(true);

    try {
      const result = await updateClientAction(formData);

      if (result.success) {
        onSuccess();
        onClose();
      } else {
        if (result.fieldErrors) {
          setFieldErrors(result.fieldErrors);
        }
        setError(result.error || "Failed to update client");
      }
    } catch (err) {
      setError("An unexpected error occurred");
    } finally {
      setIsSubmitting(false);
    }
  };

  if (!isOpen) return null;

  const hasAddress =
    client.address_line1 || client.city || client.postal_code;
  const hasHealthInfo =
    client.health_conditions ||
    client.medications ||
    client.allergies ||
    client.gp_name ||
    client.gp_practice;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 z-50 flex items-center justify-center p-4 overflow-y-auto">
      <div className="bg-white dark:bg-neutral-800 rounded-lg shadow-xl max-w-3xl w-full max-h-[90vh] overflow-y-auto">
        {/* Header */}
        <div className="px-6 py-4 border-b border-gray-200 dark:border-neutral-700 flex items-center justify-between sticky top-0 bg-white dark:bg-neutral-800 z-10">
          <div className="flex items-center gap-3">
            <div className="p-2 bg-blue-100 dark:bg-blue-900/30 rounded-lg">
              <IconUser className="w-5 h-5 text-blue-600 dark:text-blue-400" />
            </div>
            <h2 className="text-lg font-semibold text-gray-900 dark:text-white">
              Edit Client Details
            </h2>
          </div>
          <button
            onClick={onClose}
            className="p-2 hover:bg-gray-100 dark:hover:bg-neutral-700 rounded-lg transition-colors"
          >
            <IconX className="w-5 h-5 text-gray-500 dark:text-gray-400" />
          </button>
        </div>

        {/* Form */}
        <form onSubmit={handleSubmit} className="px-6 py-4 space-y-4">
          {error && (
            <Alert
              type="error"
              message={error}
              onDismiss={() => setError(null)}
            />
          )}

          {/* Personal Information */}
          <div className="space-y-4">
            <h3 className="font-medium text-gray-900 dark:text-white flex items-center gap-2">
              <IconUser className="w-4 h-4 text-blue-600 dark:text-blue-400" />
              Personal Information
            </h3>

            <div className="grid grid-cols-2 gap-4">
              <Input
                label="First Name"
                value={firstName}
                onChange={(e) => setFirstName(e.target.value)}
                placeholder="John"
                error={fieldErrors.firstName?.[0]}
                disabled={isSubmitting}
              />
              <Input
                label="Last Name"
                value={lastName}
                onChange={(e) => setLastName(e.target.value)}
                placeholder="Smith"
                error={fieldErrors.lastName?.[0]}
                disabled={isSubmitting}
              />
            </div>

            <Input
              label="Email"
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder="client@example.com"
              error={fieldErrors.email?.[0]}
              disabled={isSubmitting}
            />

            <Input
              label="Phone"
              type="tel"
              value={phone}
              onChange={(e) => setPhone(e.target.value)}
              placeholder="+44 7000 000000"
              error={fieldErrors.phone?.[0]}
              disabled={isSubmitting}
            />
          </div>

          {/* Address */}
          <CollapsibleSection
            title="Address"
            icon={
              <IconHome className="w-4 h-4 text-green-600 dark:text-green-400" />
            }
            defaultOpen={!!hasAddress}
          >
            <Input
              label="Address Line 1"
              value={addressLine1}
              onChange={(e) => setAddressLine1(e.target.value)}
              placeholder="123 Main Street"
              error={fieldErrors.addressLine1?.[0]}
              disabled={isSubmitting}
            />
            <Input
              label="Address Line 2"
              value={addressLine2}
              onChange={(e) => setAddressLine2(e.target.value)}
              placeholder="Apartment 4B"
              error={fieldErrors.addressLine2?.[0]}
              disabled={isSubmitting}
            />
            <div className="grid grid-cols-2 gap-4">
              <Input
                label="City"
                value={city}
                onChange={(e) => setCity(e.target.value)}
                placeholder="London"
                error={fieldErrors.city?.[0]}
                disabled={isSubmitting}
              />
              <Input
                label="Postal Code"
                value={postalCode}
                onChange={(e) => setPostalCode(e.target.value)}
                placeholder="SW1A 1AA"
                error={fieldErrors.postalCode?.[0]}
                disabled={isSubmitting}
              />
            </div>
            <Input
              label="Country"
              value={country}
              onChange={(e) => setCountry(e.target.value)}
              placeholder="United Kingdom"
              error={fieldErrors.country?.[0]}
              disabled={isSubmitting}
            />
          </CollapsibleSection>

          {/* Emergency Contact */}
          <CollapsibleSection
            title="Emergency Contact"
            icon={
              <IconAlertTriangle className="w-4 h-4 text-amber-600 dark:text-amber-400" />
            }
            defaultOpen={!!client.emergency_contact_name}
          >
            <Input
              label="Contact Name"
              value={emergencyContactName}
              onChange={(e) => setEmergencyContactName(e.target.value)}
              placeholder="Jane Smith"
              error={fieldErrors.emergencyContactName?.[0]}
              disabled={isSubmitting}
            />
            <Input
              label="Contact Phone"
              type="tel"
              value={emergencyContactPhone}
              onChange={(e) => setEmergencyContactPhone(e.target.value)}
              placeholder="+44 7000 000000"
              error={fieldErrors.emergencyContactPhone?.[0]}
              disabled={isSubmitting}
            />
            <Input
              label="Relationship"
              value={emergencyContactRelationship}
              onChange={(e) => setEmergencyContactRelationship(e.target.value)}
              placeholder="Spouse, Parent, Friend, etc."
              error={fieldErrors.emergencyContactRelationship?.[0]}
              disabled={isSubmitting}
            />
          </CollapsibleSection>

          {/* Health Information */}
          <CollapsibleSection
            title="Health Information"
            icon={
              <IconHeart className="w-4 h-4 text-red-600 dark:text-red-400" />
            }
            defaultOpen={!!hasHealthInfo}
          >
            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                Health Conditions
              </label>
              <textarea
                value={healthConditions}
                onChange={(e) => setHealthConditions(e.target.value)}
                placeholder="Any relevant health conditions..."
                rows={3}
                disabled={isSubmitting}
                className="w-full px-3 py-2 border rounded-lg bg-white dark:bg-neutral-800 text-gray-900 dark:text-gray-100 border-gray-300 dark:border-neutral-600 focus:outline-none focus:ring-2 focus:ring-blue-500 resize-none disabled:opacity-50"
              />
              {fieldErrors.healthConditions && (
                <p className="mt-1 text-sm text-red-600 dark:text-red-400">
                  {fieldErrors.healthConditions[0]}
                </p>
              )}
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                Medications
              </label>
              <textarea
                value={medications}
                onChange={(e) => setMedications(e.target.value)}
                placeholder="Current medications..."
                rows={2}
                disabled={isSubmitting}
                className="w-full px-3 py-2 border rounded-lg bg-white dark:bg-neutral-800 text-gray-900 dark:text-gray-100 border-gray-300 dark:border-neutral-600 focus:outline-none focus:ring-2 focus:ring-blue-500 resize-none disabled:opacity-50"
              />
              {fieldErrors.medications && (
                <p className="mt-1 text-sm text-red-600 dark:text-red-400">
                  {fieldErrors.medications[0]}
                </p>
              )}
            </div>

            <Input
              label="Allergies"
              value={allergies}
              onChange={(e) => setAllergies(e.target.value)}
              placeholder="Any allergies..."
              error={fieldErrors.allergies?.[0]}
              disabled={isSubmitting}
            />

            <div className="grid grid-cols-2 gap-4">
              <Input
                label="GP Name"
                value={gpName}
                onChange={(e) => setGpName(e.target.value)}
                placeholder="Dr. Smith"
                error={fieldErrors.gpName?.[0]}
                disabled={isSubmitting}
              />
              <Input
                label="GP Practice"
                value={gpPractice}
                onChange={(e) => setGpPractice(e.target.value)}
                placeholder="Local Medical Centre"
                error={fieldErrors.gpPractice?.[0]}
                disabled={isSubmitting}
              />
            </div>
          </CollapsibleSection>
        </form>

        {/* Actions */}
        <div className="px-6 py-4 border-t border-gray-200 dark:border-neutral-700 flex justify-end gap-3 sticky bottom-0 bg-white dark:bg-neutral-800">
          <Button variant="secondary" onClick={onClose} disabled={isSubmitting}>
            Cancel
          </Button>
          <Button onClick={handleSubmit} loading={isSubmitting}>
            Save Changes
          </Button>
        </div>
      </div>
    </div>
  );
}

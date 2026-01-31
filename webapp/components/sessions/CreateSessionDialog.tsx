"use client";

import { useState, useEffect } from "react";
import { Button } from "@/components/ui/Button";
import { Input } from "@/components/ui/Input";
import { Alert } from "@/components/ui/Alert";
import { DateInput } from "@/components/ui/DateInput";
import { TimeInput } from "@/components/ui/TimeInput";
import { createClientSessionAction } from "@/app/actions/client-sessions";
import { clientSessionSchema } from "@/lib/validation/clients";
import {
  IconX,
  IconCalendarEvent,
  IconClock,
  IconVideo,
  IconUser,
  IconPhone,
  IconMapPin,
  IconLink,
} from "@tabler/icons-react";

interface Service {
  id: string;
  title: string;
  duration_minutes: number;
  price: number | null;
  session_format: string | null;
}

interface CreateSessionDialogProps {
  isOpen: boolean;
  onClose: () => void;
  onSuccess: () => void;
  clientId: string;
  clientName: string;
  services?: Service[];
}

export function CreateSessionDialog({
  isOpen,
  onClose,
  onSuccess,
  clientId,
  clientName,
  services = [],
}: CreateSessionDialogProps) {
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [fieldErrors, setFieldErrors] = useState<Record<string, string[]>>({});

  // Form state
  const [serviceId, setServiceId] = useState<string>("");
  const [title, setTitle] = useState("");
  const [description, setDescription] = useState("");
  const [sessionDate, setSessionDate] = useState("");
  const [startTime, setStartTime] = useState("");
  const [endTime, setEndTime] = useState("");
  const [durationHours, setDurationHours] = useState(1);
  const [durationMinutesSelect, setDurationMinutesSelect] = useState(0);
  const [sessionFormat, setSessionFormat] = useState<"online" | "in-person" | "phone" | "">(
    ""
  );
  const [location, setLocation] = useState("");
  const [meetingUrl, setMeetingUrl] = useState("");
  const [therapistNotes, setTherapistNotes] = useState("");
  const [sendNotification, setSendNotification] = useState(true);

  // Client-side field validation using Zod schema
  const validateField = (fieldName: string, value: unknown) => {
    try {
      const fieldSchema = clientSessionSchema.shape[fieldName as keyof typeof clientSessionSchema.shape];
      if (fieldSchema) {
        fieldSchema.parse(value);
        setFieldErrors((prev) => {
          const updated = { ...prev };
          delete updated[fieldName];
          return updated;
        });
      }
    } catch (error: any) {
      const message = error.errors?.[0]?.message || "Invalid input";
      setFieldErrors((prev) => ({ ...prev, [fieldName]: [message] }));
    }
  };

  // Reset form when dialog opens
  useEffect(() => {
    if (isOpen) {
      setServiceId("");
      setTitle("");
      setDescription("");
      setSessionDate("");
      setStartTime("");
      setEndTime("");
      setDurationHours(1);
      setDurationMinutesSelect(0);
      setSessionFormat("");
      setLocation("");
      setMeetingUrl("");
      setTherapistNotes("");
      setSendNotification(true);
      setError(null);
      setFieldErrors({});
    }
  }, [isOpen]);

  // Compute total duration in minutes
  const totalDurationMinutes = durationHours * 60 + durationMinutesSelect;

  // Update end time when start time or duration changes
  useEffect(() => {
    if (startTime && totalDurationMinutes > 0) {
      const [hours, minutes] = startTime.split(":").map(Number);
      const startMinutes = hours * 60 + minutes;
      const endMinutes = startMinutes + totalDurationMinutes;
      const endHours = Math.floor(endMinutes / 60) % 24;
      const endMins = endMinutes % 60;
      setEndTime(
        `${String(endHours).padStart(2, "0")}:${String(endMins).padStart(2, "0")}`
      );
    }
  }, [startTime, totalDurationMinutes]);

  // Auto-fill from service selection
  const handleServiceChange = (selectedServiceId: string) => {
    setServiceId(selectedServiceId);
    if (selectedServiceId) {
      const service = services.find((s) => s.id === selectedServiceId);
      if (service) {
        setTitle(service.title);
        // Parse duration into hours and minutes (rounded to nearest 5)
        const hours = Math.floor(service.duration_minutes / 60);
        const mins = service.duration_minutes % 60;
        const roundedMins = Math.round(mins / 5) * 5;
        setDurationHours(Math.min(hours, 4)); // Cap at 4 hours
        setDurationMinutesSelect(roundedMins === 60 ? 0 : roundedMins);
        if (roundedMins === 60) {
          setDurationHours(Math.min(hours + 1, 4));
        }
        if (service.session_format) {
          setSessionFormat(service.session_format as "online" | "in-person" | "phone");
        }
      }
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    setFieldErrors({});
    setIsSubmitting(true);

    try {
      const result = await createClientSessionAction({
        clientId,
        serviceId: serviceId || null,
        title,
        description: description || undefined,
        sessionDate,
        startTime,
        endTime,
        durationMinutes: totalDurationMinutes,
        sessionFormat: sessionFormat || null,
        location: location || undefined,
        meetingUrl: meetingUrl || undefined,
        therapistNotes: therapistNotes || undefined,
        sendNotification,
      });

      if (result.success) {
        onSuccess();
        onClose();
      } else {
        if (result.fieldErrors) {
          setFieldErrors(result.fieldErrors);
        }
        setError(result.error || "Failed to create session");
      }
    } catch (err) {
      setError("An unexpected error occurred");
    } finally {
      setIsSubmitting(false);
    }
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 z-50 flex items-center justify-center p-4 overflow-y-auto">
      <div className="bg-white dark:bg-neutral-800 rounded-lg shadow-xl max-w-lg w-full max-h-[90vh] overflow-y-auto">
        {/* Header */}
        <div className="px-6 py-4 border-b border-gray-200 dark:border-neutral-700 flex items-center justify-between sticky top-0 bg-white dark:bg-neutral-800">
          <div className="flex items-center gap-3">
            <div className="p-2 bg-blue-100 dark:bg-blue-900/30 rounded-lg">
              <IconCalendarEvent className="w-5 h-5 text-blue-600 dark:text-blue-400" />
            </div>
            <div>
              <h2 className="text-lg font-semibold text-gray-900 dark:text-white">
                Schedule Session
              </h2>
              <p className="text-sm text-gray-500 dark:text-gray-400">
                with {clientName}
              </p>
            </div>
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
            <Alert type="error" message={error} onDismiss={() => setError(null)} />
          )}

          {/* Service Selection */}
          {services.length > 0 && (
            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                Service (optional)
              </label>
              <select
                value={serviceId}
                onChange={(e) => handleServiceChange(e.target.value)}
                className="w-full px-3 py-2 border rounded-lg bg-white dark:bg-neutral-800 text-gray-900 dark:text-gray-100 border-gray-300 dark:border-neutral-600 focus:outline-none focus:ring-2 focus:ring-blue-500"
              >
                <option value="">Custom session</option>
                {services.map((service) => (
                  <option key={service.id} value={service.id}>
                    {service.title} ({service.duration_minutes} min
                    {service.price ? ` - £${service.price}` : ""})
                  </option>
                ))}
              </select>
            </div>
          )}

          {/* Title */}
          <Input
            label="Session Title *"
            value={title}
            onChange={(e) => setTitle(e.target.value)}
            onBlur={() => validateField("title", title)}
            placeholder="e.g., Initial Consultation"
            error={fieldErrors.title?.[0]}
            required
          />

          {/* Date & Time */}
          <div className="grid grid-cols-2 gap-4">
            <DateInput
              label="Date"
              value={sessionDate}
              onChange={setSessionDate}
              minDate={new Date()}
              required
              error={fieldErrors.sessionDate?.[0]}
            />
            <TimeInput
              label="Start Time"
              value={startTime}
              onChange={setStartTime}
              required
              timeIntervals={5}
              error={fieldErrors.startTime?.[0]}
            />
          </div>

          {/* Duration */}
          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
              Duration
            </label>
            <div className="flex gap-2 items-center">
              <select
                value={durationHours}
                onChange={(e) => setDurationHours(Number(e.target.value))}
                className="px-3 py-2 border rounded-lg bg-white dark:bg-neutral-800 text-gray-900 dark:text-gray-100 border-gray-300 dark:border-neutral-600 focus:outline-none focus:ring-2 focus:ring-blue-500"
              >
                {[0, 1, 2, 3, 4].map((h) => (
                  <option key={h} value={h}>
                    {h} {h === 1 ? "hour" : "hours"}
                  </option>
                ))}
              </select>
              <select
                value={durationMinutesSelect}
                onChange={(e) => setDurationMinutesSelect(Number(e.target.value))}
                className="px-3 py-2 border rounded-lg bg-white dark:bg-neutral-800 text-gray-900 dark:text-gray-100 border-gray-300 dark:border-neutral-600 focus:outline-none focus:ring-2 focus:ring-blue-500"
              >
                {[0, 5, 10, 15, 20, 25, 30, 35, 40, 45, 50, 55].map((m) => (
                  <option key={m} value={m}>
                    {m} min
                  </option>
                ))}
              </select>
            </div>
            {totalDurationMinutes < 5 && (
              <p className="mt-1 text-sm text-red-600 dark:text-red-400">
                Duration must be at least 5 minutes
              </p>
            )}
          </div>

          {/* Session Format */}
          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
              Format
            </label>
            <div className="flex gap-2">
              {[
                { value: "online", label: "Online", icon: IconVideo },
                { value: "in-person", label: "In-Person", icon: IconUser },
                { value: "phone", label: "Phone", icon: IconPhone },
              ].map(({ value, label, icon: Icon }) => (
                <button
                  key={value}
                  type="button"
                  onClick={() =>
                    setSessionFormat(value as "online" | "in-person" | "phone")
                  }
                  className={`flex items-center gap-2 px-3 py-2 text-sm rounded-lg transition-colors ${
                    sessionFormat === value
                      ? "bg-blue-600 text-white"
                      : "bg-gray-100 text-gray-700 hover:bg-gray-200 dark:bg-neutral-700 dark:text-gray-300 dark:hover:bg-neutral-600"
                  }`}
                >
                  <Icon className="w-4 h-4" />
                  {label}
                </button>
              ))}
            </div>
          </div>

          {/* Location / Meeting URL */}
          {sessionFormat === "in-person" && (
            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                <IconMapPin className="w-4 h-4 inline mr-1" />
                Location
              </label>
              <input
                type="text"
                value={location}
                onChange={(e) => setLocation(e.target.value)}
                onBlur={() => location && validateField("location", location)}
                placeholder="Enter session location"
                className={`w-full px-3 py-2 border rounded-lg bg-white dark:bg-neutral-800 text-gray-900 dark:text-gray-100 focus:outline-none focus:ring-2 focus:ring-blue-500 ${
                  fieldErrors.location
                    ? "border-red-500 dark:border-red-500"
                    : "border-gray-300 dark:border-neutral-600"
                }`}
              />
              {fieldErrors.location?.[0] && (
                <p className="mt-1 text-sm text-red-600 dark:text-red-400">
                  {fieldErrors.location[0]}
                </p>
              )}
            </div>
          )}

          {sessionFormat === "online" && (
            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                <IconLink className="w-4 h-4 inline mr-1" />
                Meeting URL
              </label>
              <input
                type="url"
                value={meetingUrl}
                onChange={(e) => setMeetingUrl(e.target.value)}
                onBlur={() => meetingUrl && validateField("meetingUrl", meetingUrl)}
                placeholder="https://zoom.us/j/..."
                className={`w-full px-3 py-2 border rounded-lg bg-white dark:bg-neutral-800 text-gray-900 dark:text-gray-100 focus:outline-none focus:ring-2 focus:ring-blue-500 ${
                  fieldErrors.meetingUrl
                    ? "border-red-500 dark:border-red-500"
                    : "border-gray-300 dark:border-neutral-600"
                }`}
              />
              {fieldErrors.meetingUrl?.[0] && (
                <p className="mt-1 text-sm text-red-600 dark:text-red-400">
                  {fieldErrors.meetingUrl[0]}
                </p>
              )}
            </div>
          )}

          {/* Description */}
          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
              Description (optional)
              <span className="text-xs text-gray-400 ml-2">
                {description.length}/2000
              </span>
            </label>
            <textarea
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              onBlur={() => description && validateField("description", description)}
              placeholder="Session description visible to client..."
              rows={2}
              className={`w-full px-3 py-2 border rounded-lg bg-white dark:bg-neutral-800 text-gray-900 dark:text-gray-100 focus:outline-none focus:ring-2 focus:ring-blue-500 resize-none ${
                fieldErrors.description
                  ? "border-red-500 dark:border-red-500"
                  : "border-gray-300 dark:border-neutral-600"
              }`}
            />
            {fieldErrors.description?.[0] && (
              <p className="mt-1 text-sm text-red-600 dark:text-red-400">
                {fieldErrors.description[0]}
              </p>
            )}
          </div>

          {/* Private Notes */}
          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
              Private Notes (only visible to you)
              <span className="text-xs text-gray-400 ml-2">
                {therapistNotes.length}/5000
              </span>
            </label>
            <textarea
              value={therapistNotes}
              onChange={(e) => setTherapistNotes(e.target.value)}
              onBlur={() => therapistNotes && validateField("therapistNotes", therapistNotes)}
              placeholder="Notes for yourself..."
              rows={2}
              className={`w-full px-3 py-2 border rounded-lg bg-white dark:bg-neutral-800 text-gray-900 dark:text-gray-100 focus:outline-none focus:ring-2 focus:ring-blue-500 resize-none ${
                fieldErrors.therapistNotes
                  ? "border-red-500 dark:border-red-500"
                  : "border-gray-300 dark:border-neutral-600"
              }`}
            />
            {fieldErrors.therapistNotes?.[0] && (
              <p className="mt-1 text-sm text-red-600 dark:text-red-400">
                {fieldErrors.therapistNotes[0]}
              </p>
            )}
          </div>

          {/* Send Notification */}
          <label className="flex items-center gap-2 cursor-pointer">
            <input
              type="checkbox"
              checked={sendNotification}
              onChange={(e) => setSendNotification(e.target.checked)}
              className="w-4 h-4 rounded border-gray-300 dark:border-neutral-600 text-blue-600 focus:ring-blue-500 dark:bg-neutral-800"
            />
            <span className="text-sm text-gray-700 dark:text-gray-300">
              Send email notification to client (with calendar invite)
            </span>
          </label>
        </form>

        {/* Actions */}
        <div className="px-6 py-4 border-t border-gray-200 dark:border-neutral-700 flex justify-end gap-3 sticky bottom-0 bg-white dark:bg-neutral-800">
          <Button variant="secondary" onClick={onClose} disabled={isSubmitting}>
            Cancel
          </Button>
          <Button onClick={handleSubmit} loading={isSubmitting} disabled={!title || !sessionDate || !startTime || totalDurationMinutes < 5}>
            Schedule Session
          </Button>
        </div>
      </div>
    </div>
  );
}

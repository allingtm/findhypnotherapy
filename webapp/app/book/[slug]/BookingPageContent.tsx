"use client";

import React, { useState, useEffect, useCallback } from "react";
import { BookingCalendar } from "@/components/booking/BookingCalendar";
import { TimeSlotGrid } from "@/components/booking/TimeSlotGrid";
import { BookingForm } from "@/components/booking/BookingForm";
import { ServiceSelector, type ServiceOption } from "@/components/booking/ServiceSelector";
import { getAvailableDates, getAvailableSlots } from "@/app/actions/bookings";

interface TimeSlot {
  start_time: string;
  end_time: string;
}

interface TherapistTerms {
  id: string;
  title: string;
  content: string;
  version: string;
}

interface BookingPageContentProps {
  therapistProfileId: string;
  therapistName: string;
  maxDaysAhead: number;
  therapistTerms: TherapistTerms | null;
  services: ServiceOption[];
  initialServiceId: string | null;
}

export function BookingPageContent({
  therapistProfileId,
  therapistName,
  maxDaysAhead,
  therapistTerms,
  services,
  initialServiceId,
}: BookingPageContentProps) {
  const [currentMonth, setCurrentMonth] = useState(new Date());
  const [availableDates, setAvailableDates] = useState<string[]>([]);
  const [selectedDate, setSelectedDate] = useState<string | null>(null);
  const [timeSlots, setTimeSlots] = useState<TimeSlot[]>([]);
  const [selectedSlot, setSelectedSlot] = useState<TimeSlot | null>(null);
  const [loadingDates, setLoadingDates] = useState(true);
  const [loadingSlots, setLoadingSlots] = useState(false);
  const [selectedServiceId, setSelectedServiceId] = useState<string | null>(initialServiceId);

  // Load available dates for current month
  const loadAvailableDates = useCallback(async () => {
    setLoadingDates(true);
    try {
      const { dates } = await getAvailableDates(
        therapistProfileId,
        currentMonth.getFullYear(),
        currentMonth.getMonth() + 1
      );
      setAvailableDates(dates);
    } catch (error) {
      console.error("Failed to load available dates:", error);
    } finally {
      setLoadingDates(false);
    }
  }, [therapistProfileId, currentMonth]);

  useEffect(() => {
    loadAvailableDates();
  }, [loadAvailableDates]);

  // Load time slots when date is selected
  const loadTimeSlots = useCallback(async (date: string) => {
    setLoadingSlots(true);
    setSelectedSlot(null);
    try {
      const { slots } = await getAvailableSlots(therapistProfileId, date);
      setTimeSlots(slots);
    } catch (error) {
      console.error("Failed to load time slots:", error);
      setTimeSlots([]);
    } finally {
      setLoadingSlots(false);
    }
  }, [therapistProfileId]);

  useEffect(() => {
    if (selectedDate) {
      loadTimeSlots(selectedDate);
    } else {
      setTimeSlots([]);
      setSelectedSlot(null);
    }
  }, [selectedDate, loadTimeSlots]);

  const handleDateSelect = (date: string) => {
    setSelectedDate(date);
  };

  const handleMonthChange = (date: Date) => {
    setCurrentMonth(date);
    // Clear selection when changing months
    setSelectedDate(null);
    setTimeSlots([]);
    setSelectedSlot(null);
  };

  const handleSlotSelect = (slot: TimeSlot) => {
    setSelectedSlot(slot);
  };

  const handleBookingSuccess = () => {
    // Booking was successful, form will show success message
    // Optionally refresh slots to show updated availability
    if (selectedDate) {
      loadTimeSlots(selectedDate);
    }
  };

  return (
    <div className="space-y-6">
      {/* Service Selection */}
      <ServiceSelector
        services={services}
        selectedServiceId={selectedServiceId}
        onServiceSelect={setSelectedServiceId}
      />

      <div className="grid gap-6 lg:grid-cols-2">
        {/* Left Column: Calendar and Time Slots */}
        <div className="space-y-6">
          <BookingCalendar
            availableDates={availableDates}
            selectedDate={selectedDate}
            onSelectDate={handleDateSelect}
            currentMonth={currentMonth}
            onMonthChange={handleMonthChange}
            loading={loadingDates}
          />

          <TimeSlotGrid
            slots={timeSlots}
            selectedSlot={selectedSlot}
            onSelectSlot={handleSlotSelect}
            loading={loadingSlots}
            selectedDate={selectedDate}
          />
        </div>

        {/* Right Column: Booking Form */}
        <div>
          <BookingForm
            therapistProfileId={therapistProfileId}
            selectedDate={selectedDate}
            selectedSlot={selectedSlot}
            therapistName={therapistName}
            therapistTerms={therapistTerms}
            onSuccess={handleBookingSuccess}
            serviceId={selectedServiceId}
          />
        </div>
      </div>
    </div>
  );
}

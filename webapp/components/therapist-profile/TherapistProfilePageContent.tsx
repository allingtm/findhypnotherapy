"use client";

import { useState } from "react";
import {
  TherapistProfileTabs,
  THERAPIST_PROFILE_TABS,
} from "./TherapistProfileTabs";
import { BasicInfoSection } from "./sections/BasicInfoSection";
import { ContactSection } from "./sections/ContactSection";
import { LocationSection } from "./sections/LocationSection";
import { SessionDetailsSection } from "./sections/SessionDetailsSection";
import { SpecializationsSection } from "./sections/SpecializationsSection";
import { PublishSection } from "./sections/PublishSection";
import { AccountSection } from "./sections/AccountSection";
import { TermsEditor } from "@/components/settings/TermsEditor";
import type { Tables } from "@/lib/types/database";

interface Specialization {
  id: string;
  name: string;
  slug: string;
  category: string | null;
}

interface User {
  id: string;
  email: string;
  name: string;
  photo_url?: string | null;
}

interface TherapistProfilePageContentProps {
  profile: Tables<"therapist_profiles">;
  specializations: Specialization[];
  selectedSpecializationIds: string[];
  userName: string;
  user: User;
}

export function TherapistProfilePageContent({
  profile,
  specializations,
  selectedSpecializationIds,
  userName,
  user,
}: TherapistProfilePageContentProps) {
  const [activeTab, setActiveTab] = useState(THERAPIST_PROFILE_TABS[0].id);

  const renderTabContent = () => {
    switch (activeTab) {
      case "basic":
        return <BasicInfoSection profile={profile} />;
      case "contact":
        return <ContactSection profile={profile} />;
      case "location":
        return <LocationSection profile={profile} />;
      case "sessions":
        return <SessionDetailsSection profile={profile} />;
      case "specializations":
        return (
          <SpecializationsSection
            specializations={specializations}
            selectedSpecializationIds={selectedSpecializationIds}
          />
        );
      case "publish":
        return <PublishSection profile={profile} />;
      case "account":
        return <AccountSection user={user} />;
      case "terms":
        return <TermsEditor />;
      default:
        return <BasicInfoSection profile={profile} />;
    }
  };

  return (
    <div className="space-y-6 min-w-0 overflow-hidden">
      <TherapistProfileTabs activeTab={activeTab} onTabChange={setActiveTab} />
      <div className="mt-6">{renderTabContent()}</div>
    </div>
  );
}

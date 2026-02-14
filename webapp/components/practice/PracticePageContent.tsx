"use client";

import { useState, useEffect } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { BasicInfoSection } from "@/components/therapist-profile/sections/BasicInfoSection";
import { ContactSection } from "@/components/therapist-profile/sections/ContactSection";
import { LocationSection } from "@/components/therapist-profile/sections/LocationSection";
import { SessionDetailsSection } from "@/components/therapist-profile/sections/SessionDetailsSection";
import { SpecializationsSection } from "@/components/therapist-profile/sections/SpecializationsSection";
import { PublishSection } from "@/components/therapist-profile/sections/PublishSection";
import { ServicesSection } from "@/components/therapist-profile/ServicesSection";
import { ContentPageClient } from "@/app/dashboard/content/ContentPageClient";
import {
  IconBriefcase,
  IconUser,
  IconCurrencyPound,
  IconVideo,
  IconGlobe,
} from "@tabler/icons-react";
import { cn } from "@/lib/utils";
import type { Tables } from "@/lib/types/database";
import type { TherapistVideoWithServices } from "@/lib/types/videos";

interface Specialization {
  id: string;
  name: string;
  slug: string;
  category: string | null;
}

type TherapistService = Tables<"therapist_services">;

interface PracticePageContentProps {
  profile: Tables<"therapist_profiles">;
  specializations: Specialization[];
  selectedSpecializationIds: string[];
  services: TherapistService[];
  videos: TherapistVideoWithServices[];
}

type TabKey = "profile" | "services" | "content" | "visibility";

// Sub-tabs for the profile section
type ProfileSubTab =
  | "basic"
  | "contact"
  | "location"
  | "sessions"
  | "specializations";

const tabs: { key: TabKey; label: string; icon: typeof IconUser }[] = [
  { key: "content", label: "Content", icon: IconVideo },
  { key: "services", label: "Services", icon: IconCurrencyPound },
  { key: "profile", label: "Profile", icon: IconUser },
  { key: "visibility", label: "Visibility", icon: IconGlobe },
];

const profileSubTabs: { key: ProfileSubTab; label: string }[] = [
  { key: "basic", label: "Basic Info" },
  { key: "contact", label: "Contact" },
  { key: "location", label: "Location" },
  { key: "sessions", label: "Sessions" },
  { key: "specializations", label: "Specializations" },
];

export function PracticePageContent({
  profile,
  specializations,
  selectedSpecializationIds,
  services,
  videos,
}: PracticePageContentProps) {
  const router = useRouter();
  const searchParams = useSearchParams();
  const [activeTab, setActiveTab] = useState<TabKey>(
    (searchParams.get("tab") as TabKey) || "content"
  );
  const [profileSubTab, setProfileSubTab] = useState<ProfileSubTab>(
    (searchParams.get("section") as ProfileSubTab) || "basic"
  );

  // Update URL when tab changes
  useEffect(() => {
    const params = new URLSearchParams(searchParams.toString());
    if (activeTab === "content") {
      params.delete("tab");
      params.delete("section");
    } else if (activeTab === "profile") {
      params.set("tab", activeTab);
      if (profileSubTab !== "basic") {
        params.set("section", profileSubTab);
      } else {
        params.delete("section");
      }
    } else {
      params.set("tab", activeTab);
      params.delete("section");
    }
    const newUrl = params.toString()
      ? `/dashboard/practice?${params.toString()}`
      : "/dashboard/practice";
    router.replace(newUrl, { scroll: false });
  }, [activeTab, profileSubTab, router, searchParams]);

  // Listen for URL changes
  useEffect(() => {
    const tab = searchParams.get("tab") as TabKey;
    const section = searchParams.get("section") as ProfileSubTab;
    if (tab && tabs.some((t) => t.key === tab)) {
      setActiveTab(tab);
    } else if (!tab) {
      setActiveTab("content");
    }
    if (section && profileSubTabs.some((t) => t.key === section)) {
      setProfileSubTab(section);
    }
  }, [searchParams]);

  const renderProfileSubContent = () => {
    switch (profileSubTab) {
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
      default:
        return <BasicInfoSection profile={profile} />;
    }
  };

  return (
    <div className="w-full">
      <div className="flex items-center gap-3 mb-6">
        <IconBriefcase className="w-8 h-8 text-gray-700 dark:text-gray-300" />
        <h1 className="text-2xl font-bold text-gray-900 dark:text-white">
          Practice
        </h1>
      </div>

      {/* Main Tab Navigation */}
      <div className="border-b border-gray-200 dark:border-neutral-700 mb-6">
        <nav className="-mb-px flex space-x-4 sm:space-x-8 overflow-x-auto">
          {tabs.map((tab) => {
            const Icon = tab.icon;
            const isActive = activeTab === tab.key;

            return (
              <button
                key={tab.key}
                onClick={() => setActiveTab(tab.key)}
                className={cn(
                  "flex items-center gap-2 py-3 px-1 border-b-2 text-sm font-medium whitespace-nowrap transition-colors",
                  isActive
                    ? "border-blue-500 text-blue-600 dark:text-blue-400"
                    : "border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300 dark:text-gray-400 dark:hover:text-gray-300"
                )}
              >
                <Icon className="w-4 h-4" />
                <span>{tab.label}</span>
              </button>
            );
          })}
        </nav>
      </div>

      {/* Tab Content */}
      <div>
        {activeTab === "profile" && (
          <div className="max-w-5xl">
            <p className="text-gray-600 dark:text-gray-400 mb-4">
              Manage your professional profile information
            </p>

            {/* Profile Sub-tabs */}
            <div className="flex flex-wrap gap-2 mb-6">
              {profileSubTabs.map((subTab) => (
                <button
                  key={subTab.key}
                  onClick={() => setProfileSubTab(subTab.key)}
                  className={cn(
                    "px-3 py-1.5 text-sm font-medium rounded-full transition-colors",
                    profileSubTab === subTab.key
                      ? "bg-blue-100 text-blue-700 dark:bg-blue-900/30 dark:text-blue-300"
                      : "bg-gray-100 text-gray-600 hover:bg-gray-200 dark:bg-neutral-800 dark:text-gray-400 dark:hover:bg-neutral-700"
                  )}
                >
                  {subTab.label}
                </button>
              ))}
            </div>

            <div className="bg-white dark:bg-neutral-800 rounded-lg border border-gray-200 dark:border-neutral-700 p-4 sm:p-6">
              {renderProfileSubContent()}
            </div>
          </div>
        )}

        {activeTab === "services" && (
          <div className="max-w-5xl">
            <p className="text-gray-600 dark:text-gray-400 mb-6">
              Add the services you offer with their prices and session details.
              You need at least one service to publish your profile.
            </p>
            <ServicesSection services={services} />
          </div>
        )}

        {activeTab === "content" && (
          <div className="max-w-5xl">
            <p className="text-gray-600 dark:text-gray-400 mb-6">
              Upload videos to showcase your practice and connect with potential
              clients
            </p>
            <ContentPageClient initialVideos={videos} services={services} />
          </div>
        )}

        {activeTab === "visibility" && (
          <div className="max-w-5xl">
            <p className="text-gray-600 dark:text-gray-400 mb-6">
              Control your profile visibility and optimize for search engines
            </p>
            <div className="bg-white dark:bg-neutral-800 rounded-lg border border-gray-200 dark:border-neutral-700 p-4 sm:p-6">
              <PublishSection profile={profile} />
            </div>
          </div>
        )}
      </div>
    </div>
  );
}

"use client";

import { useRef, useEffect } from "react";
import {
  TabComponent,
  TabItemDirective,
  TabItemsDirective,
  SelectEventArgs,
} from "@syncfusion/ej2-react-navigations";
import {
  IconUser,
  IconPhone,
  IconMapPin,
  IconCalendar,
  IconBrain,
  IconWorld,
  IconUserCog,
  IconFileText,
} from "@tabler/icons-react";

export interface TherapistProfileTab {
  id: string;
  label: string;
  icon: React.ComponentType<{ className?: string }>;
}

export const THERAPIST_PROFILE_TABS: TherapistProfileTab[] = [
  { id: "account", label: "Account", icon: IconUserCog },
  { id: "basic", label: "Basic Info", icon: IconUser },
  { id: "contact", label: "Contact", icon: IconPhone },
  { id: "location", label: "Location", icon: IconMapPin },
  { id: "sessions", label: "Sessions", icon: IconCalendar },
  { id: "specializations", label: "Specialisations", icon: IconBrain },
  { id: "publish", label: "SEO & Publish", icon: IconWorld },
  { id: "terms", label: "Terms", icon: IconFileText },
];

interface TherapistProfileTabsProps {
  activeTab: string;
  onTabChange: (tabId: string) => void;
}

// Header template component for each tab
function TabHeader({ tab }: { tab: TherapistProfileTab }) {
  const IconComponent = tab.icon;
  return (
    <div className="flex items-center gap-2 px-1">
      <IconComponent className="w-4 h-4" />
      <span>{tab.label}</span>
    </div>
  );
}

export function TherapistProfileTabs({
  activeTab,
  onTabChange,
}: TherapistProfileTabsProps) {
  const tabRef = useRef<TabComponent>(null);

  // Find the index of the active tab
  const activeIndex = THERAPIST_PROFILE_TABS.findIndex(
    (tab) => tab.id === activeTab
  );

  // Update tab selection when activeTab changes externally
  useEffect(() => {
    if (tabRef.current && activeIndex >= 0) {
      tabRef.current.selectedItem = activeIndex;
    }
  }, [activeIndex]);

  const handleTabSelect = (args: SelectEventArgs) => {
    const selectedTab = THERAPIST_PROFILE_TABS[args.selectedIndex];
    if (selectedTab) {
      onTabChange(selectedTab.id);
    }
  };

  return (
    <div className="w-full min-w-0 overflow-hidden">
      <TabComponent
        ref={tabRef}
        heightAdjustMode="None"
        overflowMode="Scrollable"
        selectedItem={activeIndex >= 0 ? activeIndex : 0}
        selected={handleTabSelect}
        cssClass="e-fill"
      >
        <TabItemsDirective>
          {THERAPIST_PROFILE_TABS.map((tab) => (
            <TabItemDirective
              key={tab.id}
              headerTemplate={() => <TabHeader tab={tab} />}
            />
          ))}
        </TabItemsDirective>
      </TabComponent>
    </div>
  );
}

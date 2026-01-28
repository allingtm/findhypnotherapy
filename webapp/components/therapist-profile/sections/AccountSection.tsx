"use client";

import { ProfileForm } from "@/components/profile/ProfileForm";
import { DeleteAccountSection } from "@/components/profile/DeleteAccountSection";

interface AccountSectionProps {
  user: {
    id: string;
    email: string;
    name: string;
    photo_url?: string | null;
  };
}

export function AccountSection({ user }: AccountSectionProps) {
  return (
    <div className="space-y-8">
      <ProfileForm user={user} />
      <DeleteAccountSection userEmail={user.email} />
    </div>
  );
}

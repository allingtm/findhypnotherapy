import { redirect } from "next/navigation"
import { createClient } from "@/lib/supabase/server"
import { canAccessPortal } from "@/lib/auth/permissions"
import { PortalLoginForm } from "./PortalLoginForm"

export default async function PortalLoginPage() {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()

  // If logged in, redirect appropriately
  if (user) {
    const hasPortalAccess = await canAccessPortal(supabase)
    if (hasPortalAccess) {
      redirect("/portal")
    }
    // User is logged in but not a client - redirect to member dashboard
    redirect("/dashboard")
  }

  return <PortalLoginForm />
}

import { redirect } from "next/navigation"
import { createClient } from "@/lib/supabase/server"
import { canAccessPortal } from "@/lib/auth/permissions"
import { PortalSidebar } from "@/components/portal/PortalSidebar"

export const metadata = {
  title: "Client Portal | Find Hypnotherapy",
  description: "Access your sessions, messages, and profile",
}

export default async function PortalLayout({
  children,
}: {
  children: React.ReactNode
}) {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()

  // Redirect if not authenticated
  if (!user) {
    redirect("/portal/login")
  }

  // Check if user can access portal (is a client with active account)
  const hasAccess = await canAccessPortal(supabase)

  if (!hasAccess) {
    redirect("/portal/login?error=no_access")
  }

  // Fetch client info
  const { data: clientAccount } = await supabase
    .from("client_accounts")
    .select(`
      id,
      clients (
        id,
        first_name,
        last_name,
        email
      )
    `)
    .eq("user_id", user.id)
    .single()

  // Get first client record for display name
  const clients = clientAccount?.clients as Array<{
    id: string
    first_name: string | null
    last_name: string | null
    email: string
  }> | null

  const firstClient = clients?.[0]
  const displayName = firstClient?.first_name && firstClient?.last_name
    ? `${firstClient.first_name} ${firstClient.last_name}`
    : firstClient?.email || user.email || "Client"

  return (
    <PortalSidebar user={{ name: displayName, email: user.email || "" }}>
      {children}
    </PortalSidebar>
  )
}

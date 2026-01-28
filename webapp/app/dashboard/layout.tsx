import { redirect } from 'next/navigation'
import { createClient } from '@/lib/supabase/server'
import { canAccessDashboard } from '@/lib/auth/subscriptions'
import { DashboardSidebar } from '@/components/dashboard/DashboardSidebar'
import { SyncfusionProvider } from '@/components/providers/SyncfusionProvider'

export default async function DashboardLayout({
  children,
}: {
  children: React.ReactNode
}) {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()

  // Redirect if not authenticated
  if (!user) {
    redirect('/login')
  }

  // Check if user can access dashboard (has subscription OR is admin)
  const hasAccess = await canAccessDashboard(supabase)

  if (!hasAccess) {
    redirect('/subscribe')
  }

  // Fetch user profile
  const { data: profile } = await supabase
    .from('users')
    .select('name')
    .eq('id', user.id)
    .single()

  return (
    <SyncfusionProvider>
      <DashboardSidebar user={{ name: profile?.name, email: user.email }}>
        {children}
      </DashboardSidebar>
    </SyncfusionProvider>
  )
}

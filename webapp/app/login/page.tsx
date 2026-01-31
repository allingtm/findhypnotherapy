import { redirect } from 'next/navigation'
import { createClient } from '@/lib/supabase/server'
import { checkIsClient } from '@/lib/auth/permissions'
import { LoginPageClient } from './LoginPageClient'

interface LoginPageProps {
  searchParams: Promise<{ role?: string }>
}

export default async function LoginPage({ searchParams }: LoginPageProps) {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()

  // If already logged in, redirect based on role
  if (user) {
    const isClient = await checkIsClient(supabase)
    if (isClient) {
      redirect('/portal')
    }
    redirect('/dashboard')
  }

  // Support direct linking to a specific role via URL parameter
  const params = await searchParams
  const initialRole = params.role === 'client' || params.role === 'therapist'
    ? params.role
    : null

  return <LoginPageClient initialRole={initialRole} />
}

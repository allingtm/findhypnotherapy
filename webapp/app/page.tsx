import { createClient } from '@/lib/supabase/server'
import { HomeContent } from '@/components/home/HomeContent'

export default async function Home() {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()

  // Fetch specializations for the search dropdown
  const { data: specializations } = await supabase
    .from('specializations')
    .select('id, name, slug, category')
    .eq('is_active', true)
    .order('display_order')

  return <HomeContent user={user} specializations={specializations || []} />
}

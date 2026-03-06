import { createClient } from '@/lib/supabase/server'
import { MapView } from './map-view'
import { Navbar } from '@/components/navbar'
import { ThemeToggle } from '@/components/theme-toggle'
import { redirect } from 'next/navigation'

export default async function MapPage() {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()

  if (!user) redirect('/auth/login')

  const { data: profile } = await supabase
    .from('profiles')
    .select('*')
    .eq('id', user.id)
    .single()

  const { data: posts } = await supabase
    .from('pant_posts')
    .select('*, profiles(username, avatar_url)')
    .in('status', ['available', 'claimed'])
    .order('created_at', { ascending: false })

  return (
    <div className="flex h-screen flex-col bg-background">
      <header className="flex items-center justify-between border-b border-border bg-background px-4 py-3">
        <span className="text-lg font-bold text-primary">Pantad</span>
        <div className="flex items-center gap-2">
          <span className="rounded-full bg-primary/10 px-3 py-1 text-xs font-medium text-primary">
            ⭐ {profile?.xp ?? 0} XP
          </span>
          <ThemeToggle />
        </div>
      </header>

      <MapView initialPosts={posts ?? []} profile={profile} />

      <Navbar />
    </div>
  )
}

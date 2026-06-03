import { createClient } from '@/lib/supabase/server'
import { redirect } from 'next/navigation'
import { Navbar } from '@/components/navbar'
import { ThemeToggle } from '@/components/theme-toggle'
import { Card, CardContent } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Avatar, DEFAULT_AVATAR } from '@/components/avatar'
import { AvatarConfig } from '@/types/database'

const MEDALS = ['🥇', '🥈', '🥉']

export default async function LeaderboardPage() {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()

  if (!user) redirect('/auth/login')

  const { data: topUsers } = await supabase
    .from('profiles')
    .select('id, username, xp, total_cans, level, avatar_config')
    .order('xp', { ascending: false })
    .limit(50)

  const currentUserRank = topUsers?.findIndex((u) => u.id === user.id) ?? -1

  return (
    <div className="flex min-h-screen flex-col bg-background pb-20">
      <header className="flex items-center justify-between border-b border-border px-4 py-3">
        <span className="text-lg font-bold text-primary">Topplista</span>
        <ThemeToggle />
      </header>

      <main className="mx-auto w-full max-w-lg space-y-3 p-4">
        <p className="text-sm text-muted-foreground">Vem har samlat mest pant i Sverige?</p>

        {topUsers?.map((u, i) => {
          const isCurrentUser = u.id === user.id
          const avatarConfig = (u.avatar_config as AvatarConfig | null) ?? DEFAULT_AVATAR
          return (
            <Card
              key={u.id}
              className={isCurrentUser ? 'border-primary ring-1 ring-primary' : ''}
            >
              <CardContent className="flex items-center gap-3 p-3">
                <span className="w-8 shrink-0 text-center text-xl">
                  {MEDALS[i] ?? <span className="text-sm font-bold text-muted-foreground">#{i + 1}</span>}
                </span>
                <div className="h-12 w-12 shrink-0 overflow-hidden rounded-full bg-muted">
                  <Avatar config={avatarConfig} size={48} bust />
                </div>
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2">
                    <span className="font-semibold truncate">
                      {u.username}
                      {isCurrentUser && ' (du)'}
                    </span>
                    <Badge variant="secondary" className="shrink-0 text-xs">Nivå {u.level}</Badge>
                  </div>
                  <p className="text-sm text-muted-foreground">
                    {u.total_cans} burkar · {u.xp} XP
                  </p>
                </div>
              </CardContent>
            </Card>
          )
        })}

        {currentUserRank >= 50 && (
          <p className="text-center text-sm text-muted-foreground">
            Din placering: #{currentUserRank + 1} – Fortsätt samla för att klättra!
          </p>
        )}
      </main>

      <Navbar />
    </div>
  )
}

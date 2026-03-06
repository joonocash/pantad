import { createClient } from '@/lib/supabase/server'
import { redirect } from 'next/navigation'
import { Navbar } from '@/components/navbar'
import { ThemeToggle } from '@/components/theme-toggle'
import { Badge } from '@/components/ui/badge'
import { Progress } from '@/components/ui/progress'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { LogoutButton } from './logout-button'

function getLevel(xp: number) {
  if (xp < 100) return { level: 1, title: 'Novis', next: 100 }
  if (xp < 300) return { level: 2, title: 'Samlare', next: 300 }
  if (xp < 600) return { level: 3, title: 'Pantproffs', next: 600 }
  if (xp < 1000) return { level: 4, title: 'Miljöhjälte', next: 1000 }
  if (xp < 2000) return { level: 5, title: 'Pantmästare', next: 2000 }
  return { level: 6, title: 'Pantlegend', next: Infinity }
}

export default async function ProfilePage() {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()

  if (!user) redirect('/auth/login')

  const { data: profile } = await supabase
    .from('profiles')
    .select('*')
    .eq('id', user.id)
    .single()

  const { data: userAchievements } = await supabase
    .from('user_achievements')
    .select('*, achievements(*)')
    .eq('user_id', user.id)

  const { data: sidequests } = await supabase
    .from('sidequests')
    .select('*')
    .eq('active', true)

  const { data: userSidequests } = await supabase
    .from('user_sidequests')
    .select('*')
    .eq('user_id', user.id)

  const xp = profile?.xp ?? 0
  const { level, title, next } = getLevel(xp)
  const prevLevelXp = [0, 100, 300, 600, 1000, 2000][level - 1] ?? 0
  const levelProgress = next === Infinity ? 100 : Math.round(((xp - prevLevelXp) / (next - prevLevelXp)) * 100)

  return (
    <div className="flex min-h-screen flex-col bg-background pb-20">
      <header className="flex items-center justify-between border-b border-border px-4 py-3">
        <span className="text-lg font-bold text-primary">Profil</span>
        <ThemeToggle />
      </header>

      <main className="mx-auto w-full max-w-lg space-y-4 p-4">
        {/* Profilkort */}
        <Card>
          <CardContent className="pt-6">
            <div className="flex flex-col items-center gap-3">
              <div className="flex h-20 w-20 items-center justify-center rounded-full bg-primary/10 text-4xl">
                ♻️
              </div>
              <div className="text-center">
                <h2 className="text-xl font-bold">{profile?.username ?? 'Okänd'}</h2>
                <p className="text-sm text-muted-foreground">{user.email}</p>
              </div>
              <Badge className="text-sm">{title} – Nivå {level}</Badge>

              <div className="w-full space-y-1">
                <div className="flex justify-between text-xs text-muted-foreground">
                  <span>{xp} XP</span>
                  {next !== Infinity && <span>{next} XP</span>}
                </div>
                <Progress value={levelProgress} className="h-2" />
              </div>

              <div className="grid w-full grid-cols-2 gap-3">
                <div className="rounded-xl bg-muted p-3 text-center">
                  <div className="text-2xl font-bold text-primary">{profile?.total_cans ?? 0}</div>
                  <div className="text-xs text-muted-foreground">Burkar hämtade</div>
                </div>
                <div className="rounded-xl bg-muted p-3 text-center">
                  <div className="text-2xl font-bold text-primary">{xp}</div>
                  <div className="text-xs text-muted-foreground">Totalt XP</div>
                </div>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Sidequests */}
        <Card>
          <CardHeader>
            <CardTitle className="text-base">Veckans uppdrag</CardTitle>
          </CardHeader>
          <CardContent className="space-y-3">
            {sidequests?.length === 0 && (
              <p className="text-sm text-muted-foreground">Inga aktiva uppdrag just nu.</p>
            )}
            {sidequests?.map((sq) => {
              const progress = userSidequests?.find((us) => us.sidequest_id === sq.id)?.progress ?? 0
              const pct = Math.min(Math.round((progress / sq.requirement_value) * 100), 100)
              const done = pct >= 100
              return (
                <div key={sq.id} className="space-y-1.5">
                  <div className="flex items-center justify-between">
                    <span className={`text-sm font-medium ${done ? 'line-through text-muted-foreground' : ''}`}>
                      {sq.title}
                    </span>
                    <span className="text-xs text-primary">+{sq.xp_reward} XP</span>
                  </div>
                  <p className="text-xs text-muted-foreground">{sq.description}</p>
                  <div className="flex items-center gap-2">
                    <Progress value={pct} className="h-1.5 flex-1" />
                    <span className="text-xs text-muted-foreground">
                      {progress}/{sq.requirement_value}
                    </span>
                  </div>
                </div>
              )
            })}
          </CardContent>
        </Card>

        {/* Achievements */}
        <Card>
          <CardHeader>
            <CardTitle className="text-base">Achievements</CardTitle>
          </CardHeader>
          <CardContent>
            {userAchievements?.length === 0 ? (
              <p className="text-sm text-muted-foreground">
                Hämta din första pant för att låsa upp achievements!
              </p>
            ) : (
              <div className="grid grid-cols-2 gap-2">
                {userAchievements?.map((ua) => (
                  <div
                    key={ua.id}
                    className="flex items-center gap-2 rounded-lg bg-primary/5 p-3"
                  >
                    <span className="text-2xl">{ua.achievements?.icon}</span>
                    <div>
                      <div className="text-xs font-semibold">{ua.achievements?.title}</div>
                      <div className="text-xs text-muted-foreground">+{ua.achievements?.xp_reward} XP</div>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </CardContent>
        </Card>

        <LogoutButton />
      </main>

      <Navbar />
    </div>
  )
}

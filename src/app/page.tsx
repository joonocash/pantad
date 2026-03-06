import { redirect } from 'next/navigation'
import { createClient } from '@/lib/supabase/server'
import Link from 'next/link'
import { Button } from '@/components/ui/button'
import { ThemeToggle } from '@/components/theme-toggle'

export default async function Home() {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()

  if (user) {
    redirect('/map')
  }

  return (
    <div className="flex min-h-screen flex-col bg-background">
      <header className="flex items-center justify-between p-4">
        <span className="text-xl font-bold text-primary">Pantad</span>
        <ThemeToggle />
      </header>

      <main className="flex flex-1 flex-col items-center justify-center gap-8 px-6 text-center">
        <div className="space-y-3">
          <div className="text-6xl">♻️</div>
          <h1 className="text-4xl font-bold tracking-tight">Pantad</h1>
          <p className="max-w-sm text-lg text-muted-foreground">
            Hjälp till att städa upp pant i din stad. Tjäna pengar och
            poäng medan du gör en insats för miljön.
          </p>
        </div>

        <div className="grid w-full max-w-xs gap-3">
          <Link href="/auth/login">
            <Button className="w-full" size="lg">
              Logga in
            </Button>
          </Link>
          <Link href="/auth/register">
            <Button variant="outline" className="w-full" size="lg">
              Skapa konto
            </Button>
          </Link>
        </div>

        <div className="grid grid-cols-3 gap-6 pt-4">
          {[
            { icon: '📍', text: 'Lägg ut pant' },
            { icon: '🗺️', text: 'Se var panten finns' },
            { icon: '🏆', text: 'Tjäna belöningar' },
          ].map(({ icon, text }) => (
            <div key={text} className="flex flex-col items-center gap-2">
              <div className="flex h-14 w-14 items-center justify-center rounded-2xl bg-primary/10 text-2xl">
                {icon}
              </div>
              <span className="text-xs text-muted-foreground">{text}</span>
            </div>
          ))}
        </div>
      </main>
    </div>
  )
}

import { redirect } from 'next/navigation'
import { createClient } from '@/lib/supabase/server'
import Link from 'next/link'
import { Button } from '@/components/ui/button'
import { ThemeToggle } from '@/components/theme-toggle'
import { PersonaCarousel } from '@/components/persona-carousel'

export default async function Home() {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()

  if (user) {
    redirect('/map')
  }

  return (
    <div className="flex min-h-screen flex-col bg-background">
      <header className="flex items-center justify-between p-4">
        {/* eslint-disable-next-line @next/next/no-img-element */}
        <img src="/logo.png" alt="Pantad" className="h-8 w-auto" />
        <ThemeToggle />
      </header>

      <main className="flex flex-1 flex-col items-center justify-center gap-8 px-6 text-center">
        <div className="space-y-3">
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img src="/logo.png" alt="Pantad" className="mx-auto h-auto" style={{ width: 627, maxWidth: '384px' }} />
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

        <PersonaCarousel />
      </main>
    </div>
  )
}

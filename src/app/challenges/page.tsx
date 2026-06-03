import { Navbar } from '@/components/navbar'
import { ThemeToggle } from '@/components/theme-toggle'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { Card, CardContent } from '@/components/ui/card'

const CHALLENGES = [
  {
    id: '1',
    company: 'OLW',
    title: 'Sortera och vinn med OLW',
    description: 'Källsortera dina tomma OLW-påsar korrekt och dokumentera med ett foto. Tre vinnare väljs ut varje vecka!',
    emoji: '🥔',
    gradient: 'from-yellow-400 to-orange-500',
    prize: 'OLW-produkter för 500 kr',
    daysLeft: 18,
    participants: 1240,
    tag: 'Populär',
  },
  {
    id: '2',
    company: 'LYKO',
    title: 'Vinn ett presentkort hos LYKO',
    description: 'Samla minst 20 pantburkar och ladda upp bevis. Vinn ett presentkort och ta hand om dig!',
    emoji: '💅',
    gradient: 'from-pink-400 to-purple-500',
    prize: 'Presentkort 1 000 kr',
    daysLeft: 11,
    participants: 876,
    tag: 'Nytt',
  },
  {
    id: '3',
    company: 'IKEA',
    title: 'Vinn en stol från IKEA',
    description: 'Lyft ditt hem och miljön! Samla mest pant i din stad under månaden och vinn en POÄNG-stol.',
    emoji: '🪑',
    gradient: 'from-blue-400 to-cyan-500',
    prize: 'POÄNG-stol (1 299 kr)',
    daysLeft: 24,
    participants: 2103,
    tag: 'Stortävling',
  },
  {
    id: '4',
    company: 'Oatly',
    title: 'Panthjälte med Oatly',
    description: 'Hämta pant i närheten av en matbutik och dela din rutt. Hållbarhet smakar bättre med havre!',
    emoji: '🌾',
    gradient: 'from-green-400 to-emerald-500',
    prize: 'Oatly-box & tygkasse',
    daysLeft: 7,
    participants: 634,
    tag: 'Slutar snart',
  },
]

export default function ChallengesPage() {
  return (
    <div className="flex min-h-screen flex-col bg-background pb-20">
      <header className="flex items-center justify-between border-b border-border px-4 py-3">
        <div className="flex items-center gap-2">
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img src="/logo.png" alt="Pantad" className="h-6 w-auto" />
          <span className="text-lg font-bold text-primary">Utmaningar</span>
        </div>
        <ThemeToggle />
      </header>

      <main className="mx-auto w-full max-w-lg space-y-4 p-4">
        <div className="rounded-2xl bg-primary/10 p-4">
          <p className="text-sm font-medium text-primary">🏆 Delta i utmaningar och vinn riktiga priser</p>
          <p className="mt-1 text-xs text-muted-foreground">
            Samla pant, dokumentera och tävla mot andra – allt för miljön och chansen att vinna.
          </p>
        </div>

        {CHALLENGES.map((c) => (
          <Card key={c.id} className="overflow-hidden">
            {/* Image area */}
            <div className={`flex h-36 items-center justify-center bg-gradient-to-br ${c.gradient}`}>
              <span className="text-7xl drop-shadow-lg">{c.emoji}</span>
            </div>

            <CardContent className="p-4 space-y-3">
              <div className="flex items-start justify-between gap-2">
                <div>
                  <p className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">{c.company}</p>
                  <h2 className="font-bold leading-snug">{c.title}</h2>
                </div>
                <Badge variant="secondary" className="shrink-0 text-xs">{c.tag}</Badge>
              </div>

              <p className="text-sm text-muted-foreground">{c.description}</p>

              <div className="flex items-center gap-4 text-xs text-muted-foreground">
                <span>🎁 {c.prize}</span>
                <span>⏳ {c.daysLeft} dagar kvar</span>
              </div>

              <div className="flex items-center justify-between">
                <span className="text-xs text-muted-foreground">
                  👥 {c.participants.toLocaleString('sv-SE')} deltagare
                </span>
                <Button size="sm">Delta i utmaningen</Button>
              </div>
            </CardContent>
          </Card>
        ))}
      </main>

      <Navbar />
    </div>
  )
}

'use client'

import { Navbar } from '@/components/navbar'
import { ThemeToggle } from '@/components/theme-toggle'
import { Button } from '@/components/ui/button'
import { Card, CardContent } from '@/components/ui/card'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'

/* ── Cashback ─────────────────────────────────────────────── */
const CASHBACK = [
  {
    id: '1',
    title: '15 kr cashback på Isadora Wondernail',
    brand: 'Isadora',
    emoji: '💅',
    gradient: 'from-rose-400 to-pink-500',
    tokens: 120,
    category: 'Skönhet',
  },
  {
    id: '2',
    title: '1 000 kr cashback på MacBook Air',
    brand: 'Apple',
    emoji: '💻',
    gradient: 'from-slate-400 to-zinc-500',
    tokens: 8000,
    category: 'Elektronik',
  },
  {
    id: '3',
    title: '6 månader gratis prenumeration på Azure',
    brand: 'Microsoft',
    emoji: '☁️',
    gradient: 'from-blue-400 to-indigo-500',
    tokens: 5000,
    category: 'Teknik',
  },
  {
    id: '4',
    title: '50 kr cashback på Coop-handeln',
    brand: 'Coop',
    emoji: '🛒',
    gradient: 'from-green-400 to-teal-500',
    tokens: 400,
    category: 'Mat',
  },
]

/* ── Kuponger ─────────────────────────────────────────────── */
const KUPONGER = [
  {
    id: '1',
    title: '3 månader gratis läsning på Readily',
    brand: 'Readily',
    emoji: '📚',
    gradient: 'from-orange-400 to-amber-500',
    tokens: 600,
    tag: 'Populär',
  },
  {
    id: '2',
    title: 'Klippkort på Tegel',
    brand: 'Tegel',
    emoji: '✂️',
    gradient: 'from-stone-500 to-neutral-600',
    tokens: 900,
    tag: 'Exklusivt',
  },
  {
    id: '3',
    title: 'Gratis övernattning på Andréen och Partners hundhotell i Linköping',
    brand: 'Andréen & Partners',
    emoji: '🐕',
    gradient: 'from-lime-400 to-green-500',
    tokens: 1200,
    tag: 'Nytt',
  },
  {
    id: '4',
    title: '20% rabatt på Gymgrossisten',
    brand: 'Gymgrossisten',
    emoji: '💪',
    gradient: 'from-red-400 to-orange-500',
    tokens: 300,
    tag: 'Begränsad tid',
  },
]

/* ── Pengar ───────────────────────────────────────────────── */
const TOKEN_RATES = [
  { kr: 5, tokens: 50, gradient: 'from-green-400 to-emerald-500', emoji: '🪙' },
  { kr: 10, tokens: 100, gradient: 'from-teal-400 to-cyan-500', emoji: '💵' },
  { kr: 20, tokens: 200, gradient: 'from-blue-400 to-indigo-500', emoji: '💶' },
  { kr: 50, tokens: 500, gradient: 'from-violet-400 to-purple-500', emoji: '💷' },
  { kr: 100, tokens: 1000, gradient: 'from-amber-400 to-yellow-500', emoji: '💰' },
]

/* ── Helpers ──────────────────────────────────────────────── */
function RewardCard({ emoji, gradient, title, brand, tokens, tag }: {
  emoji: string
  gradient: string
  title: string
  brand: string
  tokens: number
  tag?: string
}) {
  return (
    <Card className="overflow-hidden">
      <div className={`flex h-28 items-center justify-center bg-gradient-to-br ${gradient}`}>
        <span className="text-6xl drop-shadow-lg">{emoji}</span>
      </div>
      <CardContent className="p-3 space-y-2">
        <div>
          <p className="text-[10px] font-semibold uppercase tracking-wider text-muted-foreground">{brand}</p>
          <p className="text-sm font-medium leading-snug">{title}</p>
        </div>
        <div className="flex items-center justify-between">
          <span className="text-xs font-semibold text-primary">{tokens.toLocaleString('sv-SE')} Tokens</span>
          {tag && <span className="rounded-full bg-primary/10 px-2 py-0.5 text-[9px] font-semibold text-primary">{tag}</span>}
        </div>
        <Button size="sm" className="w-full">Lös in</Button>
      </CardContent>
    </Card>
  )
}

/* ── Sida ─────────────────────────────────────────────────── */
export default function RewardsPage() {
  return (
    <div className="flex min-h-screen flex-col bg-background pb-20">
      <header className="flex items-center justify-between border-b border-border px-4 py-3">
        <div className="flex items-center gap-2">
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img src="/logo.png" alt="Pantad" className="h-6 w-auto" />
          <span className="text-lg font-bold text-primary">Belöningar</span>
        </div>
        <ThemeToggle />
      </header>

      <main className="mx-auto w-full max-w-lg p-4">
        <Tabs defaultValue="cashback">
          <TabsList className="grid w-full grid-cols-4 mb-4">
            <TabsTrigger value="cashback" className="text-xs">Cashback</TabsTrigger>
            <TabsTrigger value="kuponger" className="text-xs">Kuponger</TabsTrigger>
            <TabsTrigger value="pengar" className="text-xs">Pengar</TabsTrigger>
            <TabsTrigger value="overfOR" className="text-xs">Överför</TabsTrigger>
          </TabsList>

          {/* ── Cashback ── */}
          <TabsContent value="cashback" className="space-y-4">
            <div className="rounded-2xl bg-primary/10 p-4">
              <p className="text-sm font-semibold text-primary">💸 Cashback på dina favoritmärken</p>
              <p className="mt-1 text-xs text-muted-foreground">
                Lös in dina Tokens mot cashback. Pengarna sätts in direkt på ditt konto.
              </p>
            </div>
            <div className="grid grid-cols-2 gap-3">
              {CASHBACK.map((item) => (
                <RewardCard
                  key={item.id}
                  emoji={item.emoji}
                  gradient={item.gradient}
                  title={item.title}
                  brand={item.brand}
                  tokens={item.tokens}
                  tag={item.category}
                />
              ))}
            </div>
          </TabsContent>

          {/* ── Kuponger ── */}
          <TabsContent value="kuponger" className="space-y-4">
            <div className="rounded-2xl bg-primary/10 p-4">
              <p className="text-sm font-semibold text-primary">🎟️ Spara pengar på kuponger</p>
              <p className="mt-1 text-xs text-muted-foreground">
                Lös in Tokens mot exklusiva erbjudanden och rabatter hos utvalda partners.
              </p>
            </div>
            <div className="grid grid-cols-2 gap-3">
              {KUPONGER.map((item) => (
                <RewardCard
                  key={item.id}
                  emoji={item.emoji}
                  gradient={item.gradient}
                  title={item.title}
                  brand={item.brand}
                  tokens={item.tokens}
                  tag={item.tag}
                />
              ))}
            </div>
          </TabsContent>

          {/* ── Pengar ── */}
          <TabsContent value="pengar" className="space-y-4">
            <div className="rounded-2xl bg-primary/10 p-4">
              <p className="text-sm font-semibold text-primary">💰 Omvandla Tokens till pengar</p>
              <p className="mt-1 text-xs text-muted-foreground">
                Välj hur mycket du vill ta ut. Pengarna överförs till ditt registrerade bankkonto.
              </p>
            </div>
            <div className="grid grid-cols-2 gap-3">
              {TOKEN_RATES.map((rate) => (
                <Card key={rate.kr} className="overflow-hidden">
                  <div className={`flex h-24 items-center justify-center bg-gradient-to-br ${rate.gradient}`}>
                    <span className="text-5xl drop-shadow-lg">{rate.emoji}</span>
                  </div>
                  <CardContent className="p-3 text-center space-y-2">
                    <p className="text-xl font-bold">{rate.kr} kr</p>
                    <p className="text-xs text-muted-foreground">= {rate.tokens.toLocaleString('sv-SE')} Tokens</p>
                    <Button size="sm" className="w-full">Välj</Button>
                  </CardContent>
                </Card>
              ))}
            </div>
          </TabsContent>

          {/* ── Överför ── */}
          <TabsContent value="overfOR" className="space-y-4">
            <div className="rounded-2xl bg-primary/10 p-4">
              <p className="text-sm font-semibold text-primary">🏦 Överför pengar till bankkonto</p>
              <p className="mt-1 text-xs text-muted-foreground">
                Lägg till ditt bankkonto en gång, sedan är det enkelt att ta ut dina intjänade pengar.
              </p>
            </div>

            <div className="flex flex-col items-center justify-center gap-4 rounded-2xl border-2 border-dashed border-border p-10 text-center">
              <span className="text-5xl">🏦</span>
              <div>
                <p className="font-semibold">Inget bankkonto kopplat</p>
                <p className="mt-1 text-sm text-muted-foreground">
                  Lägg till ett bankkonto för att kunna ta ut pengar från Pantad.
                </p>
              </div>
              <Button className="w-full max-w-xs">Lägg till bankkonto</Button>
            </div>

            <Card>
              <CardContent className="p-4 space-y-2">
                <p className="text-sm font-semibold">ℹ️ Så här fungerar det</p>
                <ul className="space-y-1 text-xs text-muted-foreground">
                  <li>• Koppa ditt Swish- eller bankkontonummer</li>
                  <li>• Välj belopp i fliken "Pengar"</li>
                  <li>• Utbetalning sker inom 1–3 bankdagar</li>
                  <li>• Minsta uttagsbelopp: 5 kr (50 Tokens)</li>
                </ul>
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>
      </main>

      <Navbar />
    </div>
  )
}

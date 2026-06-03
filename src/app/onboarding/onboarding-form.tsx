'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { createClient } from '@/lib/supabase/client'
import {
  Avatar,
  AvatarConfig,
  DEFAULT_AVATAR,
  SKIN_TONES,
  HAIR_STYLES,
  HAIR_COLORS,
  TOP_STYLES,
  TOP_COLORS,
  BOTTOM_STYLES,
  BOTTOM_COLORS,
} from '@/components/avatar'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { toast } from 'sonner'
import { Loader2 } from 'lucide-react'
import { cn } from '@/lib/utils'

interface OnboardingFormProps {
  userId: string
  initialUsername: string
  isEdit?: boolean
}

export function OnboardingForm({ userId, initialUsername, isEdit = false }: OnboardingFormProps) {
  const [username, setUsername] = useState(initialUsername)
  const [config, setConfig] = useState<AvatarConfig>(DEFAULT_AVATAR)
  const [loading, setLoading] = useState(false)
  const router = useRouter()
  const supabase = createClient()

  function set<K extends keyof AvatarConfig>(key: K, value: AvatarConfig[K]) {
    setConfig((prev) => ({ ...prev, [key]: value }))
  }

  async function handleSubmit() {
    const trimmed = username.trim()
    if (trimmed.length < 2) {
      toast.error('Smeknamnet måste vara minst 2 tecken.')
      return
    }
    if (trimmed.length > 24) {
      toast.error('Smeknamnet får vara max 24 tecken.')
      return
    }

    setLoading(true)

    const { error } = await supabase
      .from('profiles')
      .update({ username: trimmed, avatar_config: config, onboarded: true })
      .eq('id', userId)

    if (error) {
      if (error.code === '23505') {
        toast.error('Det smeknamnet är redan taget – välj ett annat.')
      } else {
        toast.error('Något gick fel. Försök igen.')
      }
      setLoading(false)
      return
    }

    toast.success(isEdit ? 'Avataren sparad!' : 'Välkommen till Pantad!')
    router.push('/map')
    router.refresh()
  }

  return (
    <div className="min-h-screen bg-background pb-28">
      <header className="border-b border-border px-4 py-4">
        <div className="flex items-center gap-2">
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img src="/logo.png" alt="Pantad" className="h-6 w-auto" />
          <h1 className="text-lg font-bold text-primary">
            {isEdit ? 'Redigera avatar' : 'Skapa din karaktär'}
          </h1>
        </div>
        {!isEdit && (
          <p className="text-sm text-muted-foreground">Välj smeknamn och anpassa hur du ser ut</p>
        )}
      </header>

      <main className="mx-auto max-w-md space-y-6 px-4 py-6">
        {/* Avatar preview */}
        <div className="flex justify-center">
          <div className="flex items-end justify-center overflow-hidden rounded-3xl bg-gradient-to-b from-muted/30 to-muted/70" style={{ width: 140, height: 175 }}>
            <Avatar config={config} size={130} />
          </div>
        </div>

        {/* Username */}
        <div className="space-y-1.5">
          <Label htmlFor="username">Smeknamn</Label>
          <Input
            id="username"
            value={username}
            onChange={(e) => setUsername(e.target.value)}
            placeholder="Välj ett smeknamn..."
            maxLength={24}
            autoComplete="off"
          />
          <p className="text-xs text-muted-foreground">Syns för andra spelare i topplistan</p>
        </div>

        {/* Skin tone */}
        <section className="space-y-2">
          <h2 className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">Hudfärg</h2>
          <div className="flex gap-3">
            {SKIN_TONES.map((tone) => (
              <button
                key={tone.value}
                onClick={() => set('skin', tone.value)}
                title={tone.label}
                className={cn(
                  'h-9 w-9 rounded-full border-2 transition-all',
                  config.skin === tone.value ? 'border-primary scale-110 shadow-md' : 'border-transparent'
                )}
                style={{ backgroundColor: tone.value }}
              />
            ))}
          </div>
        </section>

        {/* Hair */}
        <section className="space-y-2">
          <h2 className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">Hår</h2>
          <div className="grid grid-cols-4 gap-2">
            {HAIR_STYLES.map((style) => (
              <button
                key={style.value}
                onClick={() => set('hair', style.value)}
                className={cn(
                  'rounded-lg border py-2 text-xs font-medium transition-colors',
                  config.hair === style.value
                    ? 'border-primary bg-primary/10 text-primary'
                    : 'border-border text-muted-foreground hover:border-primary/50'
                )}
              >
                {style.label}
              </button>
            ))}
          </div>
          {config.hair !== 'bald' && (
            <div className="flex gap-2 flex-wrap">
              {HAIR_COLORS.map((color) => (
                <button
                  key={color.value}
                  onClick={() => set('hairColor', color.value)}
                  title={color.label}
                  className={cn(
                    'h-8 w-8 rounded-full border-2 transition-all',
                    config.hairColor === color.value ? 'border-primary scale-110 shadow-md' : 'border-transparent'
                  )}
                  style={{ backgroundColor: color.value }}
                />
              ))}
            </div>
          )}
        </section>

        {/* Top */}
        <section className="space-y-2">
          <h2 className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">Överkropp</h2>
          <div className="grid grid-cols-4 gap-2">
            {TOP_STYLES.map((style) => (
              <button
                key={style.value}
                onClick={() => set('top', style.value)}
                className={cn(
                  'rounded-lg border py-2 text-xs font-medium transition-colors',
                  config.top === style.value
                    ? 'border-primary bg-primary/10 text-primary'
                    : 'border-border text-muted-foreground hover:border-primary/50'
                )}
              >
                {style.label}
              </button>
            ))}
          </div>
          <div className="flex gap-2 flex-wrap">
            {TOP_COLORS.map((color) => (
              <button
                key={color.value}
                onClick={() => set('topColor', color.value)}
                title={color.label}
                className={cn(
                  'h-8 w-8 rounded-full border-2 transition-all',
                  config.topColor === color.value ? 'border-primary scale-110 shadow-md' : 'border-transparent'
                )}
                style={{ backgroundColor: color.value }}
              />
            ))}
          </div>
        </section>

        {/* Bottom */}
        <section className="space-y-2">
          <h2 className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">Underkropp</h2>
          <div className="grid grid-cols-4 gap-2">
            {BOTTOM_STYLES.map((style) => (
              <button
                key={style.value}
                onClick={() => set('bottom', style.value)}
                className={cn(
                  'rounded-lg border py-2 text-xs font-medium transition-colors',
                  config.bottom === style.value
                    ? 'border-primary bg-primary/10 text-primary'
                    : 'border-border text-muted-foreground hover:border-primary/50'
                )}
              >
                {style.label}
              </button>
            ))}
          </div>
          <div className="flex gap-2 flex-wrap">
            {BOTTOM_COLORS.map((color) => (
              <button
                key={color.value}
                onClick={() => set('bottomColor', color.value)}
                title={color.label}
                className={cn(
                  'h-8 w-8 rounded-full border-2 transition-all',
                  config.bottomColor === color.value ? 'border-primary scale-110 shadow-md' : 'border-transparent'
                )}
                style={{ backgroundColor: color.value }}
              />
            ))}
          </div>
        </section>
      </main>

      {/* Sticky submit */}
      <div className="fixed bottom-0 left-0 right-0 border-t border-border bg-background/95 p-4 backdrop-blur supports-[backdrop-filter]:bg-background/80">
        <div className="mx-auto max-w-md">
          <Button onClick={handleSubmit} disabled={loading} className="w-full" size="lg">
            {loading && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
            {isEdit ? 'Spara' : 'Kom igång!'}
          </Button>
        </div>
      </div>
    </div>
  )
}

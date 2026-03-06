'use client'

import { useState, useEffect } from 'react'
import { createClient } from '@/lib/supabase/client'
import { PantPost } from '@/types/database'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Sheet, SheetContent, SheetHeader, SheetTitle, SheetDescription } from '@/components/ui/sheet'
import { toast } from 'sonner'
import { Loader2, MapPin, Navigation, MapPinned, Trash2 } from 'lucide-react'

interface EditPantSheetProps {
  post: PantPost | null
  open: boolean
  onClose: () => void
  userLocation: { lat: number; lng: number } | null
  movedLocation: { lat: number; lng: number } | null
  onStartMove: () => void
  onDelete: (id: string) => void
}

export function EditPantSheet({
  post,
  open,
  onClose,
  userLocation,
  movedLocation,
  onStartMove,
  onDelete,
}: EditPantSheetProps) {
  const [minCans, setMinCans] = useState('')
  const [maxCans, setMaxCans] = useState('')
  const [comment, setComment] = useState('')
  const [loading, setLoading] = useState(false)
  const [confirmDelete, setConfirmDelete] = useState(false)
  const supabase = createClient()

  // Fyll i nuvarande värden när post ändras
  useEffect(() => {
    if (post) {
      setMinCans(String(post.can_count_min))
      setMaxCans(String(post.can_count_max))
      setComment(post.comment ?? '')
      setConfirmDelete(false)
    }
  }, [post])

  if (!post) return null

  const activeLocation = movedLocation ?? userLocation ?? { lat: post.latitude, lng: post.longitude }
  const locationChanged =
    movedLocation !== null &&
    (movedLocation.lat !== post.latitude || movedLocation.lng !== post.longitude)

  async function handleSave(e: React.FormEvent) {
    e.preventDefault()
    if (!post) return
    setLoading(true)

    const { error } = await supabase
      .from('pant_posts')
      .update({
        can_count_min: parseInt(minCans),
        can_count_max: parseInt(maxCans),
        comment: comment || null,
        latitude: activeLocation.lat,
        longitude: activeLocation.lng,
      })
      .eq('id', post.id)

    if (error) {
      toast.error('Kunde inte spara ändringarna.')
    } else {
      toast.success('Panten är uppdaterad!')
      onClose()
    }
    setLoading(false)
  }

  async function handleDelete() {
    if (!post) return
    if (!confirmDelete) {
      setConfirmDelete(true)
      return
    }
    setLoading(true)
    const { error } = await supabase.from('pant_posts').delete().eq('id', post.id)
    if (error) {
      toast.error('Kunde inte ta bort panten.')
    } else {
      onDelete(post.id)
      toast.success('Panten är borttagen.')
      onClose()
    }
    setLoading(false)
  }

  return (
    <Sheet open={open} onOpenChange={onClose}>
      <SheetContent side="bottom" className="rounded-t-2xl">
        <SheetHeader>
          <SheetTitle>Redigera pant</SheetTitle>
          <SheetDescription>
            Uppdatera info, flytta eller ta bort din pant.
          </SheetDescription>
        </SheetHeader>

        <form onSubmit={handleSave} className="mt-4 space-y-4">
          {/* Position */}
          <div className="space-y-2">
            <Label>Position</Label>
            <div className="flex items-center gap-2 rounded-lg bg-muted px-3 py-2">
              <MapPin className="h-4 w-4 shrink-0 text-muted-foreground" />
              <span className="flex-1 truncate text-sm text-muted-foreground">
                {locationChanged
                  ? `Ny position: ${activeLocation.lat.toFixed(5)}, ${activeLocation.lng.toFixed(5)}`
                  : `${post.latitude.toFixed(5)}, ${post.longitude.toFixed(5)}`}
              </span>
              {locationChanged && (
                <span className="rounded-full bg-amber-500/20 px-2 py-0.5 text-xs font-medium text-amber-600 dark:text-amber-400">
                  Ny plats
                </span>
              )}
            </div>
            <div className="grid grid-cols-2 gap-2">
              <button
                type="button"
                onClick={onStartMove}
                className="flex items-center justify-center gap-1.5 rounded-lg border border-border px-3 py-2 text-sm font-medium text-muted-foreground transition-colors hover:border-primary hover:text-primary"
              >
                <MapPinned className="h-4 w-4" />
                Flytta på kartan
              </button>
              <button
                type="button"
                onClick={() => {
                  if (!userLocation) { toast.error('GPS ej tillgänglig.'); return }
                  toast.info('Positionen är uppdaterad till din GPS.')
                }}
                className="flex items-center justify-center gap-1.5 rounded-lg border border-border px-3 py-2 text-sm font-medium text-muted-foreground transition-colors hover:border-primary hover:text-primary"
                disabled={!userLocation}
              >
                <Navigation className="h-4 w-4" />
                Flytta till GPS
              </button>
            </div>
          </div>

          {/* Antal */}
          <div className="grid grid-cols-2 gap-3">
            <div className="space-y-1.5">
              <Label htmlFor="edit-min">Minst antal</Label>
              <Input
                id="edit-min"
                type="number"
                min="1"
                max="999"
                value={minCans}
                onChange={(e) => setMinCans(e.target.value)}
                required
              />
            </div>
            <div className="space-y-1.5">
              <Label htmlFor="edit-max">Ungefär max</Label>
              <Input
                id="edit-max"
                type="number"
                min="1"
                max="999"
                value={maxCans}
                onChange={(e) => setMaxCans(e.target.value)}
                required
              />
            </div>
          </div>

          {/* Kommentar */}
          <div className="space-y-1.5">
            <Label htmlFor="edit-comment">Kommentar</Label>
            <Input
              id="edit-comment"
              placeholder='T.ex. "Vid bänken nära fontänen"'
              value={comment}
              onChange={(e) => setComment(e.target.value)}
              maxLength={200}
            />
          </div>

          <Button type="submit" className="w-full" disabled={loading}>
            {loading && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
            Spara ändringar
          </Button>

          {/* Ta bort */}
          <Button
            type="button"
            variant={confirmDelete ? 'destructive' : 'outline'}
            className="w-full"
            onClick={handleDelete}
            disabled={loading}
          >
            <Trash2 className="mr-2 h-4 w-4" />
            {confirmDelete ? 'Tryck igen för att bekräfta borttagning' : 'Ta bort pant'}
          </Button>

          {confirmDelete && (
            <button
              type="button"
              onClick={() => setConfirmDelete(false)}
              className="w-full text-center text-sm text-muted-foreground hover:text-foreground"
            >
              Avbryt
            </button>
          )}
        </form>
      </SheetContent>
    </Sheet>
  )
}

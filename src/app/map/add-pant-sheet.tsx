'use client'

import { useState, useRef, useEffect } from 'react'
import { createClient } from '@/lib/supabase/client'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Sheet, SheetContent, SheetHeader, SheetTitle, SheetDescription } from '@/components/ui/sheet'
import { toast } from 'sonner'
import { Camera, Loader2, MapPin, Navigation, Map } from 'lucide-react'

interface AddPantSheetProps {
  open: boolean
  onClose: () => void
  userLocation: { lat: number; lng: number } | null
  pinnedLocation: { lat: number; lng: number } | null
  userId: string
}

export function AddPantSheet({ open, onClose, userLocation, pinnedLocation, userId }: AddPantSheetProps) {
  const [minCans, setMinCans] = useState('1')
  const [maxCans, setMaxCans] = useState('10')
  const [comment, setComment] = useState('')
  const [photo, setPhoto] = useState<File | null>(null)
  const [photoPreview, setPhotoPreview] = useState<string | null>(null)
  const [loading, setLoading] = useState(false)
  const [useGps, setUseGps] = useState(!pinnedLocation)
  const fileRef = useRef<HTMLInputElement>(null)
  const supabase = createClient()

  // Synka useGps när pinnedLocation ändras (t.ex. kartklick vs FAB)
  useEffect(() => {
    setUseGps(!pinnedLocation)
  }, [pinnedLocation])

  // Kartposition har prioritet om GPS saknas
  const activeLocation = useGps
    ? (userLocation ?? pinnedLocation)
    : (pinnedLocation ?? userLocation)

  function handlePhotoChange(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0]
    if (!file) return
    setPhoto(file)
    setPhotoPreview(URL.createObjectURL(file))
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault()

    if (!activeLocation) {
      toast.error('Ingen position vald. Tryck på kartan eller tillåt GPS.')
      return
    }

    setLoading(true)

    let photoUrl: string | null = null

    if (photo) {
      const ext = photo.name.split('.').pop()
      const fileName = `${userId}/${Date.now()}.${ext}`
      const { error: uploadError } = await supabase.storage
        .from('pant-photos')
        .upload(fileName, photo, { upsert: false })

      if (uploadError) {
        toast.error('Kunde inte ladda upp bilden')
        setLoading(false)
        return
      }

      const { data: { publicUrl } } = supabase.storage
        .from('pant-photos')
        .getPublicUrl(fileName)
      photoUrl = publicUrl
    }

    const { error } = await supabase.from('pant_posts').insert({
      user_id: userId,
      latitude: activeLocation.lat,
      longitude: activeLocation.lng,
      can_count_min: parseInt(minCans),
      can_count_max: parseInt(maxCans),
      comment: comment || null,
      photo_url: photoUrl,
      status: 'available',
    })

    if (error) {
      toast.error('Något gick fel. Försök igen.')
      setLoading(false)
      return
    }

    toast.success('Panten är utlagd! Tack för att du hjälper till.')
    setMinCans('1')
    setMaxCans('10')
    setComment('')
    setPhoto(null)
    setPhotoPreview(null)
    onClose()
    setLoading(false)
  }

  return (
    <Sheet open={open} onOpenChange={onClose}>
      <SheetContent side="bottom" className="rounded-t-2xl">
        <SheetHeader>
          <SheetTitle>Lägg ut pant</SheetTitle>
          <SheetDescription>
            Markera var din pant finns så att någon kan hämta den.
          </SheetDescription>
        </SheetHeader>

        <form onSubmit={handleSubmit} className="mt-4 space-y-4">
          {/* Position-väljare */}
          {pinnedLocation && userLocation && (
            <div className="grid grid-cols-2 gap-2">
              <button
                type="button"
                onClick={() => setUseGps(false)}
                className={`flex items-center justify-center gap-1.5 rounded-lg border px-3 py-2 text-sm font-medium transition-colors ${
                  !useGps
                    ? 'border-amber-500 bg-amber-500/10 text-amber-600 dark:text-amber-400'
                    : 'border-border text-muted-foreground hover:border-primary'
                }`}
              >
                <Map className="h-4 w-4" />
                Kartposition
              </button>
              <button
                type="button"
                onClick={() => setUseGps(true)}
                className={`flex items-center justify-center gap-1.5 rounded-lg border px-3 py-2 text-sm font-medium transition-colors ${
                  useGps
                    ? 'border-primary bg-primary/10 text-primary'
                    : 'border-border text-muted-foreground hover:border-primary'
                }`}
              >
                <Navigation className="h-4 w-4" />
                Min GPS
              </button>
            </div>
          )}
          <div className="flex items-center gap-2 rounded-lg bg-muted px-3 py-2">
            <MapPin className="h-4 w-4 text-muted-foreground shrink-0" />
            <span className="truncate text-sm text-muted-foreground">
              {activeLocation
                ? `${activeLocation.lat.toFixed(5)}, ${activeLocation.lng.toFixed(5)}`
                : 'Ingen position – tryck på kartan eller tillåt GPS'}
            </span>
          </div>

          {/* Antal burkar */}
          <div className="grid grid-cols-2 gap-3">
            <div className="space-y-1.5">
              <Label htmlFor="min-cans">Minst antal</Label>
              <Input
                id="min-cans"
                type="number"
                min="1"
                max="999"
                value={minCans}
                onChange={(e) => setMinCans(e.target.value)}
                required
              />
            </div>
            <div className="space-y-1.5">
              <Label htmlFor="max-cans">Ungefär max</Label>
              <Input
                id="max-cans"
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
            <Label htmlFor="comment">Kommentar (valfritt)</Label>
            <Input
              id="comment"
              placeholder='T.ex. "Vid bänken nära fontänen, röd kylväska"'
              value={comment}
              onChange={(e) => setComment(e.target.value)}
              maxLength={200}
            />
          </div>

          {/* Foto */}
          <div className="space-y-1.5">
            <Label>Foto (valfritt)</Label>
            <input
              ref={fileRef}
              type="file"
              accept="image/*"
              capture="environment"
              className="hidden"
              onChange={handlePhotoChange}
            />
            {photoPreview ? (
              <div className="relative">
                {/* eslint-disable-next-line @next/next/no-img-element */}
                <img
                  src={photoPreview}
                  alt="Förhandsvisning"
                  className="h-32 w-full rounded-lg object-cover"
                />
                <button
                  type="button"
                  onClick={() => { setPhoto(null); setPhotoPreview(null) }}
                  className="absolute right-2 top-2 rounded-full bg-black/50 px-2 py-0.5 text-xs text-white"
                >
                  Ta bort
                </button>
              </div>
            ) : (
              <button
                type="button"
                onClick={() => fileRef.current?.click()}
                className="flex h-20 w-full items-center justify-center gap-2 rounded-lg border-2 border-dashed border-border text-sm text-muted-foreground transition-colors hover:border-primary hover:text-primary"
              >
                <Camera className="h-5 w-5" />
                Ta ett foto
              </button>
            )}
          </div>

          <Button type="submit" className="w-full" disabled={loading || !activeLocation}>
            {loading && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
            Lägg ut pant
          </Button>
        </form>
      </SheetContent>
    </Sheet>
  )
}

'use client'

import { useState, useEffect } from 'react'
import { createClient } from '@/lib/supabase/client'
import { PantPost } from '@/types/database'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { Card, CardContent } from '@/components/ui/card'
import { toast } from 'sonner'
import { X, Navigation, Package, Loader2, CheckCircle2, Pencil } from 'lucide-react'

interface PantPostCardProps {
  post: PantPost & { profiles?: { username?: string; avatar_url?: string | null } }
  userLocation: { lat: number; lng: number } | null
  currentUserId?: string
  onClose: () => void
  onEdit?: (post: PantPost) => void
}

const COLLECT_RADIUS_METERS = 100

function getDistance(
  lat1: number, lng1: number,
  lat2: number, lng2: number
): number {
  const R = 6371000
  const dLat = ((lat2 - lat1) * Math.PI) / 180
  const dLng = ((lng2 - lng1) * Math.PI) / 180
  const a =
    Math.sin(dLat / 2) ** 2 +
    Math.cos((lat1 * Math.PI) / 180) *
    Math.cos((lat2 * Math.PI) / 180) *
    Math.sin(dLng / 2) ** 2
  return R * 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a))
}

const STATUS_LABELS: Record<PantPost['status'], { label: string; variant: 'default' | 'secondary' | 'outline' }> = {
  available: { label: 'Ledig', variant: 'default' },
  claimed: { label: 'Paxtad', variant: 'secondary' },
  collected: { label: 'Hämtad', variant: 'outline' },
}

export function PantPostCard({ post, userLocation, currentUserId, onClose, onEdit }: PantPostCardProps) {
  const [loading, setLoading] = useState(false)
  const [isClaimer, setIsClaimer] = useState(false)
  // Optimistisk lokal status – uppdateras direkt utan att vänta på realtime
  const [localStatus, setLocalStatus] = useState<PantPost['status']>(post.status)
  const supabase = createClient()

  const isOwner = currentUserId === post.user_id

  // Kolla om nuvarande användare är den som paxxat (körs vid mount + vid statusändring)
  useEffect(() => {
    if (localStatus !== 'claimed' || !currentUserId) return
    supabase
      .from('claims')
      .select('id')
      .eq('post_id', post.id)
      .eq('collector_id', currentUserId)
      .is('collected_at', null)
      .maybeSingle()
      .then(({ data }) => setIsClaimer(!!data))
  }, [localStatus, currentUserId, post.id, supabase])

  const distanceToPost = userLocation
    ? getDistance(userLocation.lat, userLocation.lng, post.latitude, post.longitude)
    : null

  const isNearby = distanceToPost !== null && distanceToPost <= COLLECT_RADIUS_METERS

  async function handleClaim() {
    setLoading(true)
    const { error: claimError } = await supabase.from('claims').insert({
      post_id: post.id,
      collector_id: currentUserId,
    })

    if (claimError) {
      toast.error('Kunde inte paxxa panten. Försök igen.')
      setLoading(false)
      return
    }

    const { error } = await supabase
      .from('pant_posts')
      .update({ status: 'claimed' })
      .eq('id', post.id)

    if (error) {
      toast.error('Något gick fel.')
    } else {
      setIsClaimer(true)
      setLocalStatus('claimed')
      toast.success('Du har paxxat panten! Du har 30 min på dig att hämta den.')
    }
    setLoading(false)
  }

  async function handleUnclaim() {
    setLoading(true)
    await supabase.from('claims').delete().eq('post_id', post.id).eq('collector_id', currentUserId)
    const { error } = await supabase.from('pant_posts').update({ status: 'available' }).eq('id', post.id)
    if (error) {
      toast.error('Något gick fel.')
    } else {
      setIsClaimer(false)
      setLocalStatus('available')
      toast.info('Du avpaxxade panten – den är ledig igen.')
    }
    setLoading(false)
  }

  async function handleCollect() {
    if (!isNearby) {
      toast.error(`Du måste vara inom ${COLLECT_RADIUS_METERS} meter för att markera som hämtad.`)
      return
    }

    setLoading(true)

    const { error: claimUpdateError } = await supabase
      .from('claims')
      .update({ collected_at: new Date().toISOString() })
      .eq('post_id', post.id)
      .eq('collector_id', currentUserId)

    const { error } = await supabase
      .from('pant_posts')
      .update({ status: 'collected' })
      .eq('id', post.id)

    if (error || claimUpdateError) {
      toast.error('Något gick fel.')
    } else {
      setLocalStatus('collected')
      const cans = Math.round((post.can_count_min + post.can_count_max) / 2)
      toast.success(`Snyggt! +${cans} burkar registrerade. Tack för hjälpen!`)
    }
    setLoading(false)
    onClose()
  }

  const { label, variant } = STATUS_LABELS[localStatus]

  return (
    <Card className="shadow-xl">
      <CardContent className="p-4">
        <div className="flex items-start justify-between gap-2">
          <div className="flex-1">
            <div className="flex items-center gap-2">
              <span className="font-semibold">
                {post.can_count_min}–{post.can_count_max} burkar
              </span>
              <Badge variant={variant}>{label}</Badge>
            </div>
            {post.comment && (
              <p className="mt-1 text-sm text-muted-foreground">{post.comment}</p>
            )}
            {distanceToPost !== null && (
              <p className="mt-1 text-xs text-muted-foreground">
                <Navigation className="mr-1 inline h-3 w-3" />
                {distanceToPost < 1000
                  ? `${Math.round(distanceToPost)} m bort`
                  : `${(distanceToPost / 1000).toFixed(1)} km bort`}
              </p>
            )}
            {post.profiles?.username && (
              <p className="mt-1 text-xs text-muted-foreground">
                Av {post.profiles.username}
              </p>
            )}
          </div>

          {post.photo_url && (
            // eslint-disable-next-line @next/next/no-img-element
            <img
              src={post.photo_url}
              alt="Pant"
              className="h-16 w-16 rounded-lg object-cover"
            />
          )}

          <button
            onClick={onClose}
            className="rounded-full p-1 text-muted-foreground hover:text-foreground"
          >
            <X className="h-4 w-4" />
          </button>
        </div>

        {/* Knappar */}
        {!isOwner && (
          <div className="mt-3 space-y-2">
            {localStatus === 'available' && (
              <Button className="w-full" onClick={handleClaim} disabled={loading}>
                {loading ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : <Package className="mr-2 h-4 w-4" />}
                Jag är på väg – paxxa!
              </Button>
            )}

            {localStatus === 'claimed' && isClaimer && (
              <>
                <Button
                  className="w-full"
                  onClick={handleCollect}
                  disabled={loading || !isNearby}
                  variant={isNearby ? 'default' : 'secondary'}
                >
                  {loading ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : <CheckCircle2 className="mr-2 h-4 w-4" />}
                  {isNearby ? 'Jag har hämtat panten!' : `Kom inom ${COLLECT_RADIUS_METERS}m för att bekräfta`}
                </Button>
                <Button className="w-full" variant="outline" onClick={handleUnclaim} disabled={loading}>
                  Avpaxxa – kan inte hämta ändå
                </Button>
              </>
            )}

            {localStatus === 'claimed' && !isClaimer && (
              <p className="text-center text-sm text-muted-foreground">
                Någon är redan på väg hit
              </p>
            )}
          </div>
        )}

        {isOwner && (
          <div className="mt-3">
            <Button
              variant="outline"
              className="w-full"
              onClick={() => onEdit?.(post)}
            >
              <Pencil className="mr-2 h-4 w-4" />
              Redigera / ta bort
            </Button>
          </div>
        )}
      </CardContent>
    </Card>
  )
}

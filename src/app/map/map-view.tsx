'use client'

import { useState, useEffect, useRef } from 'react'
import {
  APIProvider,
  Map,
  AdvancedMarker,
  MapMouseEvent,
} from '@vis.gl/react-google-maps'
import { createClient } from '@/lib/supabase/client'
import { PantPost, Profile } from '@/types/database'
import { Button } from '@/components/ui/button'
import { Plus, Navigation, Package } from 'lucide-react'
import { AddPantSheet } from './add-pant-sheet'
import { EditPantSheet } from './edit-pant-sheet'
import { PantPostCard } from './pant-post-card'
import { cn } from '@/lib/utils'

const STOCKHOLM_CENTER = { lat: 59.3293, lng: 18.0686 }

interface MapViewProps {
  initialPosts: (PantPost & { profiles?: Pick<Profile, 'username' | 'avatar_url'> })[]
  profile: Profile | null
}

export function MapView({ initialPosts, profile }: MapViewProps) {
  const [posts, setPosts] = useState(initialPosts)
  const [selectedPost, setSelectedPost] = useState<PantPost | null>(null)
  const [showAddSheet, setShowAddSheet] = useState(false)
  const [userLocation, setUserLocation] = useState<{ lat: number; lng: number } | null>(null)
  const [mapCenter, setMapCenter] = useState(STOCKHOLM_CENTER)
  const [mode, setMode] = useState<'drop' | 'collect'>(profile?.current_mode ?? 'collect')
  const [droppedPin, setDroppedPin] = useState<{ lat: number; lng: number } | null>(null)
  const [editPost, setEditPost] = useState<PantPost | null>(null)
  const [showEditSheet, setShowEditSheet] = useState(false)
  const [moveMode, setMoveMode] = useState(false)
  const [movedLocation, setMovedLocation] = useState<{ lat: number; lng: number } | null>(null)
  // Ref för att bevara editPost under move-läge (Radix kan rensa state vid sheet-stängning)
  const editPostRef = useRef<PantPost | null>(null)
  // Flagga för att skilja move-stängning från vanlig stängning
  const moveModeRef = useRef(false)
  const supabase = createClient()

  // Hämta användarens position
  useEffect(() => {
    navigator.geolocation?.getCurrentPosition(
      (pos) => {
        const loc = { lat: pos.coords.latitude, lng: pos.coords.longitude }
        setUserLocation(loc)
        setMapCenter(loc)
      },
      () => {
        // Fallback till Stockholm om GPS nekas
      },
      { enableHighAccuracy: true }
    )
  }, [])

  // Realtidsuppdateringar via Supabase
  useEffect(() => {
    const channel = supabase
      .channel('pant_posts_realtime')
      .on(
        'postgres_changes',
        { event: '*', schema: 'public', table: 'pant_posts' },
        (payload) => {
          if (payload.eventType === 'INSERT') {
            setPosts((prev) => [payload.new as PantPost, ...prev])
          } else if (payload.eventType === 'UPDATE') {
            const updated = payload.new as PantPost
            if (updated.status === 'collected') {
              setPosts((prev) => prev.filter((p) => p.id !== updated.id))
            } else {
              setPosts((prev) => prev.map((p) => (p.id === updated.id ? { ...p, ...updated } : p)))
            }
            if (selectedPost?.id === updated.id) {
              setSelectedPost(updated.status === 'collected' ? null : { ...selectedPost, ...updated })
            }
          } else if (payload.eventType === 'DELETE') {
            const deletedId = (payload.old as { id: string }).id
            setPosts((prev) => prev.filter((p) => p.id !== deletedId))
            if (selectedPost?.id === deletedId) setSelectedPost(null)
          }
        }
      )
      .subscribe()

    return () => { supabase.removeChannel(channel) }
  }, [supabase, selectedPost])

  async function toggleMode() {
    const newMode = mode === 'collect' ? 'drop' : 'collect'
    setMode(newMode)
    setDroppedPin(null)
    if (profile) {
      await supabase.from('profiles').update({ current_mode: newMode }).eq('id', profile.id)
    }
  }

  function handleMapClick(e: MapMouseEvent) {
    if (!e.detail.latLng) return
    const loc = { lat: e.detail.latLng.lat, lng: e.detail.latLng.lng }

    if (moveMode) {
      setMovedLocation(loc)
      setMoveMode(false)
      // Återställ editPost från ref (Radix kan ha rensat state)
      setEditPost(editPostRef.current)
      setShowEditSheet(true)
      return
    }

    if (mode !== 'drop') return
    setDroppedPin(loc)
    setSelectedPost(null)
    setShowAddSheet(true)
  }

  function handleCloseSheet() {
    setShowAddSheet(false)
    setDroppedPin(null)
  }

  function handleStartMove() {
    moveModeRef.current = true
    setMoveMode(true)
    setMovedLocation(null)
    setShowEditSheet(false)
  }

  function handleCloseEdit() {
    // Om sheet stängs på grund av move-läge, bevara editPostRef och avbryt
    if (moveModeRef.current) {
      moveModeRef.current = false
      return
    }
    setShowEditSheet(false)
    setEditPost(null)
    editPostRef.current = null
    setMovedLocation(null)
    setMoveMode(false)
  }

  function handleDeletePost(id: string) {
    setPosts((prev) => prev.filter((p) => p.id !== id))
    setSelectedPost(null)
  }

  function getMarkerStyle(status: PantPost['status']) {
    if (status === 'available') return 'bg-green-500 border-green-600'
    if (status === 'claimed') return 'bg-amber-500 border-amber-600'
    return 'bg-gray-400 border-gray-500'
  }

  return (
    <div className="relative flex-1">
      <APIProvider apiKey={process.env.NEXT_PUBLIC_GOOGLE_MAPS_API_KEY!}>
        <Map
          mapId="pantad-map"
          defaultCenter={mapCenter}
          defaultZoom={14}
          gestureHandling="greedy"
          disableDefaultUI
          className="h-full w-full"
          colorScheme="FOLLOW_SYSTEM"
          onClick={handleMapClick}
        >
          {/* Pins för pant */}
          {posts.map((post) => (
            <AdvancedMarker
              key={post.id}
              position={{ lat: post.latitude, lng: post.longitude }}
              onClick={(e) => { e.stop(); setSelectedPost(post) }}
            >
              <div className="flex flex-col items-center cursor-pointer">
                <div className={`flex items-center gap-1 rounded-full border-2 px-2.5 py-1 text-xs font-bold text-white shadow-lg ${getMarkerStyle(post.status)}`}>
                  🥤 {post.can_count_min}–{post.can_count_max}
                </div>
                <div className={`h-2 w-0.5 ${post.status === 'available' ? 'bg-green-500' : 'bg-amber-500'}`} />
              </div>
            </AdvancedMarker>
          ))}

          {/* Användarens GPS-position */}
          {userLocation && (
            <AdvancedMarker position={userLocation}>
              <div className="h-4 w-4 rounded-full border-2 border-white bg-blue-500 shadow-lg" />
            </AdvancedMarker>
          )}

          {/* Vald kartposition (förhandsvisning) */}
          {droppedPin && showAddSheet && (
            <AdvancedMarker position={droppedPin}>
              <div className="flex flex-col items-center">
                <div className="h-5 w-5 rounded-full border-2 border-white bg-amber-500 shadow-xl ring-4 ring-amber-500/30" />
                <div className="h-2 w-0.5 bg-amber-500" />
              </div>
            </AdvancedMarker>
          )}
        </Map>
      </APIProvider>

      {/* Mode-växlare */}
      <div className="absolute left-4 top-4 z-10">
        <button
          onClick={toggleMode}
          className={cn(
            'flex items-center gap-2 rounded-full px-4 py-2 text-sm font-semibold shadow-lg transition-all',
            mode === 'collect'
              ? 'bg-primary text-primary-foreground'
              : 'bg-amber-500 text-white'
          )}
        >
          {mode === 'collect' ? (
            <><Package className="h-4 w-4" /> Hämta pant</>
          ) : (
            <><Navigation className="h-4 w-4" /> Lägger ut pant</>
          )}
        </button>
      </div>

      {/* Hint i drop-läge */}
      {mode === 'drop' && !showAddSheet && !moveMode && (
        <div className="absolute left-1/2 top-16 z-10 -translate-x-1/2">
          <div className="rounded-full bg-black/60 px-4 py-1.5 text-xs text-white backdrop-blur">
            Tryck på kartan för att placera pant
          </div>
        </div>
      )}

      {/* Hint i flytta-läge */}
      {moveMode && (
        <div className="absolute left-1/2 top-16 z-10 -translate-x-1/2 flex flex-col items-center gap-2">
          <div className="rounded-full bg-amber-500 px-4 py-1.5 text-xs font-semibold text-white shadow-lg">
            Tryck på kartan för att flytta panten
          </div>
          <button
            onClick={() => { setMoveMode(false); setEditPost(editPostRef.current); setShowEditSheet(true) }}
            className="rounded-full bg-black/60 px-3 py-1 text-xs text-white backdrop-blur"
          >
            Avbryt
          </button>
        </div>
      )}

      {/* FAB – öppnar med GPS-position */}
      {mode === 'drop' && (
        <div className="absolute bottom-24 right-4 z-10">
          <Button
            size="lg"
            className="h-14 w-14 rounded-full shadow-xl"
            onClick={() => { setDroppedPin(null); setShowAddSheet(true) }}
            title="Använd min GPS-position"
          >
            <Plus className="h-6 w-6" />
          </Button>
        </div>
      )}

      {/* Legenda */}
      <div className="absolute right-4 top-4 z-10 flex flex-col gap-1 rounded-xl bg-background/95 p-2 shadow-lg backdrop-blur">
        {[
          { color: 'bg-green-500', label: 'Ledig' },
          { color: 'bg-amber-500', label: 'Paxtad' },
        ].map(({ color, label }) => (
          <div key={label} className="flex items-center gap-2">
            <div className={`h-2.5 w-2.5 rounded-full ${color}`} />
            <span className="text-xs text-muted-foreground">{label}</span>
          </div>
        ))}
      </div>

      {/* Vald post-kort */}
      {selectedPost && (
        <div className="absolute bottom-20 left-4 right-4 z-10">
          <PantPostCard
            post={selectedPost}
            userLocation={userLocation}
            currentUserId={profile?.id}
            onClose={() => setSelectedPost(null)}
            onEdit={(p) => { editPostRef.current = p; setEditPost(p); setShowEditSheet(true); setSelectedPost(null) }}
          />
        </div>
      )}

      <AddPantSheet
        open={showAddSheet}
        onClose={handleCloseSheet}
        userLocation={userLocation}
        pinnedLocation={droppedPin}
        userId={profile?.id ?? ''}
      />

      <EditPantSheet
        post={editPost}
        open={showEditSheet}
        onClose={handleCloseEdit}
        userLocation={userLocation}
        movedLocation={movedLocation}
        onStartMove={handleStartMove}
        onDelete={handleDeletePost}
      />
    </div>
  )
}

'use client'

import { useState, useEffect, useCallback } from 'react'
import { ChevronLeft, ChevronRight } from 'lucide-react'

const PERSONAS = ['/persona1.png', '/persona2.png', '/persona3.png']
const INTERVAL_MS = 5000

export function PersonaCarousel() {
  const [current, setCurrent] = useState(0)
  const [visible, setVisible] = useState(true)

  const goTo = useCallback((index: number) => {
    setVisible(false)
    setTimeout(() => {
      setCurrent(index)
      setVisible(true)
    }, 300)
  }, [])

  const next = useCallback(() => {
    goTo((current + 1) % PERSONAS.length)
  }, [current, goTo])

  const prev = useCallback(() => {
    goTo((current - 1 + PERSONAS.length) % PERSONAS.length)
  }, [current, goTo])

  useEffect(() => {
    const timer = setInterval(next, INTERVAL_MS)
    return () => clearInterval(timer)
  }, [next])

  return (
    <div className="relative w-full max-w-xs mx-auto select-none">
      {/* Bild */}
      <div className="relative overflow-hidden rounded-2xl">
        {/* eslint-disable-next-line @next/next/no-img-element */}
        <img
          src={PERSONAS[current]}
          alt={`Persona ${current + 1}`}
          className="w-full h-auto object-cover transition-opacity duration-300"
          style={{ opacity: visible ? 1 : 0 }}
        />

        {/* Vänsterpil */}
        <button
          onClick={prev}
          className="absolute left-2 top-1/2 -translate-y-1/2 flex h-8 w-8 items-center justify-center rounded-full bg-black/30 text-white backdrop-blur-sm transition-colors hover:bg-black/50"
          aria-label="Föregående"
        >
          <ChevronLeft className="h-5 w-5" />
        </button>

        {/* Högerpil */}
        <button
          onClick={next}
          className="absolute right-2 top-1/2 -translate-y-1/2 flex h-8 w-8 items-center justify-center rounded-full bg-black/30 text-white backdrop-blur-sm transition-colors hover:bg-black/50"
          aria-label="Nästa"
        >
          <ChevronRight className="h-5 w-5" />
        </button>
      </div>

      {/* Punktindikatorer */}
      <div className="mt-3 flex justify-center gap-2">
        {PERSONAS.map((_, i) => (
          <button
            key={i}
            onClick={() => goTo(i)}
            className="h-1.5 rounded-full transition-all duration-300"
            style={{
              width: i === current ? 24 : 6,
              backgroundColor: i === current ? 'hsl(var(--primary))' : 'hsl(var(--muted-foreground) / 0.4)',
            }}
            aria-label={`Gå till bild ${i + 1}`}
          />
        ))}
      </div>
    </div>
  )
}

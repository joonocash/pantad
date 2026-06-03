import { AvatarConfig } from '@/types/database'

export type { AvatarConfig }

export const SKIN_TONES = [
  { label: 'Ljus', value: '#FDDBB4' },
  { label: 'Mellanjus', value: '#F0BF86' },
  { label: 'Medel', value: '#D4956A' },
  { label: 'Mellenmörk', value: '#9E6042' },
  { label: 'Mörk', value: '#5C3317' },
]

export const HAIR_STYLES = [
  { label: 'Kort', value: 'short' },
  { label: 'Lång', value: 'long' },
  { label: 'Lockig', value: 'curly' },
  { label: 'Skallig', value: 'bald' },
]

export const HAIR_COLORS = [
  { label: 'Svart', value: '#1a0500' },
  { label: 'Mörkbrun', value: '#3d1a0a' },
  { label: 'Brun', value: '#7a3b1e' },
  { label: 'Auburn', value: '#9e3b1a' },
  { label: 'Blond', value: '#c8922a' },
  { label: 'Ljusblond', value: '#e8c870' },
]

export const TOP_STYLES = [
  { label: 'T-shirt', value: 'tshirt' },
  { label: 'Hoodie', value: 'hoodie' },
  { label: 'Jacka', value: 'jacket' },
  { label: 'Linne', value: 'tanktop' },
]

export const TOP_COLORS = [
  { label: 'Svart', value: '#1c1c2e' },
  { label: 'Blå', value: '#2563eb' },
  { label: 'Röd', value: '#dc2626' },
  { label: 'Grön', value: '#16a34a' },
  { label: 'Lila', value: '#7c3aed' },
  { label: 'Grå', value: '#6b7280' },
]

export const BOTTOM_STYLES = [
  { label: 'Jeans', value: 'jeans' },
  { label: 'Shorts', value: 'shorts' },
  { label: 'Kjol', value: 'skirt' },
  { label: 'Mjukis', value: 'sweatpants' },
]

export const BOTTOM_COLORS = [
  { label: 'Mörkblå', value: '#1e3a5f' },
  { label: 'Svart', value: '#1c1c2e' },
  { label: 'Grå', value: '#4b5563' },
  { label: 'Brun', value: '#7c4f2a' },
  { label: 'Mörkgrön', value: '#14532d' },
  { label: 'Bordeaux', value: '#881337' },
]

export const DEFAULT_AVATAR: AvatarConfig = {
  skin: '#F0BF86',
  hair: 'short',
  hairColor: '#3d1a0a',
  top: 'tshirt',
  topColor: '#2563eb',
  bottom: 'jeans',
  bottomColor: '#1e3a5f',
}

function dk(hex: string, amount = 40): string {
  const n = parseInt(hex.replace('#', ''), 16)
  const r = Math.max(0, Math.min(255, (n >> 16) - amount))
  const g = Math.max(0, Math.min(255, ((n >> 8) & 0xff) - amount))
  const b = Math.max(0, Math.min(255, (n & 0xff) - amount))
  return `#${r.toString(16).padStart(2, '0')}${g.toString(16).padStart(2, '0')}${b.toString(16).padStart(2, '0')}`
}

interface AvatarProps {
  config: AvatarConfig
  size?: number
  bust?: boolean
  className?: string
}

export function Avatar({ config, size = 80, bust = false, className }: AvatarProps) {
  const { skin, hair, hairColor, top, topColor, bottom, bottomColor } = config
  const skinDk = dk(skin, 30)
  const topDk = dk(topColor, 35)
  const botDk = dk(bottomColor, 30)
  const browColor = hair === 'bald' ? '#6b4c30' : hairColor

  const viewBox = bust ? '10 3 80 80' : '0 0 100 140'
  const svgHeight = bust ? size : Math.round(size * 1.4)

  return (
    <svg
      viewBox={viewBox}
      width={size}
      height={svgHeight}
      xmlns="http://www.w3.org/2000/svg"
      className={className}
    >
      {/* Long hair sides – rendered first so body covers them */}
      {hair === 'long' && (
        <>
          <path d="M29,37 Q20,60 22,88 Q24,98 29,101 Q27,80 30,60 Q31,46 29,37" fill={hairColor} />
          <path d="M71,37 Q80,60 78,88 Q76,98 71,101 Q73,80 70,60 Q69,46 71,37" fill={hairColor} />
        </>
      )}

      {/* Curly hair blob – behind head so face appears on top */}
      {hair === 'curly' && (
        <>
          <ellipse cx="50" cy="20" rx="25" ry="19" fill={hairColor} />
          <circle cx="29" cy="26" r="10" fill={hairColor} />
          <circle cx="71" cy="26" r="10" fill={hairColor} />
        </>
      )}

      {/* Bottom clothing */}
      {bottom === 'jeans' && (
        <>
          <rect x="26" y="89" width="48" height="5" rx="1" fill={botDk} />
          <path d="M26,93 L22,138 L44,138 L47,93 Z" fill={bottomColor} />
          <path d="M74,93 L78,138 L56,138 L53,93 Z" fill={bottomColor} />
          <line x1="50" y1="93" x2="50" y2="113" stroke={botDk} strokeWidth="1" />
        </>
      )}
      {bottom === 'shorts' && (
        <>
          <rect x="26" y="89" width="48" height="4" rx="1" fill={botDk} />
          <path d="M26,92 L23,118 L44,118 L47,92 Z" fill={bottomColor} />
          <path d="M74,92 L77,118 L56,118 L53,92 Z" fill={bottomColor} />
          <line x1="50" y1="92" x2="50" y2="108" stroke={botDk} strokeWidth="1" />
        </>
      )}
      {bottom === 'skirt' && (
        <>
          <rect x="26" y="89" width="48" height="5" rx="2" fill={botDk} />
          <path d="M26,93 L13,134 L87,134 L74,93 Z" fill={bottomColor} />
          <line x1="50" y1="93" x2="50" y2="134" stroke={botDk} strokeWidth="0.5" opacity="0.3" />
        </>
      )}
      {bottom === 'sweatpants' && (
        <>
          <rect x="24" y="87" width="52" height="7" rx="3" fill={botDk} />
          <path d="M44,91 L50,88 L56,91" stroke="#fff" strokeWidth="1.5" fill="none" strokeLinecap="round" opacity="0.6" />
          <path d="M24,93 L19,134 L43,138 L47,93 Z" fill={bottomColor} />
          <path d="M76,93 L81,134 L57,138 L53,93 Z" fill={bottomColor} />
          <line x1="50" y1="93" x2="50" y2="112" stroke={botDk} strokeWidth="1" />
          <path d="M19,128 Q31,137 43,135" stroke={botDk} strokeWidth="2.5" fill="none" />
          <path d="M81,128 Q69,137 57,135" stroke={botDk} strokeWidth="2.5" fill="none" />
        </>
      )}

      {/* Top clothing */}
      {top === 'tanktop' && (
        <>
          <rect x="11" y="62" width="12" height="27" rx="5" fill={skin} />
          <rect x="77" y="62" width="12" height="27" rx="5" fill={skin} />
          <path d="M36,57 L31,89 L69,89 L64,57 Q59,65 50,65 Q41,65 36,57 Z" fill={topColor} />
          <path d="M36,57 Q33,59 31,62 L36,62 L38,57 Z" fill={topColor} />
          <path d="M64,57 Q67,59 69,62 L64,62 L62,57 Z" fill={topColor} />
        </>
      )}
      {top === 'tshirt' && (
        <>
          <path d="M20,62 L11,78 L22,81 L28,64 Z" fill={topColor} />
          <path d="M80,62 L89,78 L78,81 L72,64 Z" fill={topColor} />
          <rect x="11" y="79" width="12" height="10" rx="5" fill={skin} />
          <rect x="77" y="79" width="12" height="10" rx="5" fill={skin} />
          <path d="M20,62 L27,89 L73,89 L80,62 Q66,55 50,55 Q34,55 20,62 Z" fill={topColor} />
          <path d="M40,57 Q50,63 60,57" stroke={topDk} strokeWidth="1.5" fill="none" />
        </>
      )}
      {top === 'hoodie' && (
        <>
          <path d="M20,62 L10,80 L22,83 L28,64 Z" fill={topColor} />
          <path d="M80,62 L90,80 L78,83 L72,64 Z" fill={topColor} />
          <rect x="10" y="81" width="13" height="8" rx="4" fill={skin} />
          <rect x="77" y="81" width="13" height="8" rx="4" fill={skin} />
          <path d="M20,62 L27,89 L73,89 L80,62 Q66,55 50,55 Q34,55 20,62 Z" fill={topColor} />
          <path d="M40,57 Q50,64 60,57" stroke={topDk} strokeWidth="2" fill="none" />
          <rect x="37" y="72" width="26" height="15" rx="3" fill={topDk} />
          <line x1="50" y1="72" x2="50" y2="87" stroke={topColor} strokeWidth="0.7" />
        </>
      )}
      {top === 'jacket' && (
        <>
          <path d="M20,62 L10,80 L22,83 L28,64 Z" fill={topColor} />
          <path d="M80,62 L90,80 L78,83 L72,64 Z" fill={topColor} />
          <rect x="10" y="81" width="13" height="8" rx="4" fill={skin} />
          <rect x="77" y="81" width="13" height="8" rx="4" fill={skin} />
          <path d="M45,57 L42,89 L58,89 L55,57 Q52,62 50,62 Q48,62 45,57 Z" fill="#f1f5f9" />
          <path d="M20,62 L27,89 L42,89 L45,57 Q34,57 20,62 Z" fill={topColor} />
          <path d="M80,62 L73,89 L58,89 L55,57 Q66,57 80,62 Z" fill={topColor} />
          <path d="M45,57 Q36,59 28,65 L34,72 L45,62 Z" fill={topColor} />
          <path d="M55,57 Q64,59 72,65 L66,72 L55,62 Z" fill={topColor} />
          <circle cx="50" cy="74" r="1.5" fill={topDk} />
          <circle cx="50" cy="82" r="1.5" fill={topDk} />
        </>
      )}

      {/* Neck */}
      <rect x="43" y="51" width="14" height="12" fill={skin} />

      {/* Ears */}
      <ellipse cx="29" cy="34" rx="4" ry="5" fill={skin} />
      <ellipse cx="71" cy="34" rx="4" ry="5" fill={skin} />
      <ellipse cx="29" cy="34" rx="2" ry="3" fill={skinDk} />
      <ellipse cx="71" cy="34" rx="2" ry="3" fill={skinDk} />

      {/* Head */}
      <circle cx="50" cy="33" r="21" fill={skin} />

      {/* Hair on top of head */}
      {(hair === 'short' || hair === 'long') && (
        <path d="M29,30 Q30,12 50,12 Q70,12 71,30 Q62,18 50,18 Q38,18 29,30 Z" fill={hairColor} />
      )}
      {hair === 'curly' && (
        <>
          <circle cx="50" cy="13" r="8" fill={hairColor} />
          <circle cx="35" cy="19" r="7" fill={hairColor} />
          <circle cx="65" cy="19" r="7" fill={hairColor} />
        </>
      )}

      {/* Eyes */}
      <circle cx="43" cy="32" r="4.5" fill="white" />
      <circle cx="57" cy="32" r="4.5" fill="white" />
      <circle cx="43" cy="33" r="2.8" fill="#111827" />
      <circle cx="57" cy="33" r="2.8" fill="#111827" />
      <circle cx="44" cy="31.5" r="1.1" fill="white" />
      <circle cx="58" cy="31.5" r="1.1" fill="white" />

      {/* Eyebrows */}
      <path d="M39,26 Q43,23 47,26" stroke={browColor} strokeWidth="1.8" fill="none" strokeLinecap="round" />
      <path d="M53,26 Q57,23 61,26" stroke={browColor} strokeWidth="1.8" fill="none" strokeLinecap="round" />

      {/* Nose */}
      <path d="M49,38 Q50,41 51,38" stroke={skinDk} strokeWidth="1.2" fill="none" strokeLinecap="round" />

      {/* Mouth */}
      <path d="M44,44 Q50,50 56,44" stroke="#b05548" strokeWidth="1.8" fill="none" strokeLinecap="round" />

      {/* Blush */}
      <ellipse cx="38" cy="40" rx="4" ry="2.5" fill="#ff8888" opacity="0.2" />
      <ellipse cx="62" cy="40" rx="4" ry="2.5" fill="#ff8888" opacity="0.2" />
    </svg>
  )
}

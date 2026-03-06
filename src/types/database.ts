export type PantStatus = 'available' | 'claimed' | 'collected'
export type UserMode = 'drop' | 'collect'

export interface Profile {
  id: string
  email: string
  username: string
  avatar_url: string | null
  xp: number
  level: number
  total_cans: number
  current_mode: UserMode
  created_at: string
}

export interface PantPost {
  id: string
  user_id: string
  latitude: number
  longitude: number
  can_count_min: number
  can_count_max: number
  comment: string | null
  photo_url: string | null
  status: PantStatus
  created_at: string
  expires_at: string | null
  profiles?: Profile
}

export interface Claim {
  id: string
  post_id: string
  collector_id: string
  claimed_at: string
  expires_at: string
  collected_at: string | null
  pant_posts?: PantPost
  profiles?: Profile
}

export interface Achievement {
  id: string
  slug: string
  title: string
  description: string
  icon: string
  xp_reward: number
  requirement_type: string
  requirement_value: number
}

export interface UserAchievement {
  id: string
  user_id: string
  achievement_id: string
  earned_at: string
  achievements?: Achievement
}

export interface Sidequest {
  id: string
  title: string
  description: string
  xp_reward: number
  requirement_type: string
  requirement_value: number
  active: boolean
  resets_weekly: boolean
}

export interface UserSidequest {
  id: string
  user_id: string
  sidequest_id: string
  progress: number
  completed_at: string | null
  week_start: string | null
  sidequests?: Sidequest
}

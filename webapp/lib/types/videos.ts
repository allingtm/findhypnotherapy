export type VideoStatus = 'processing' | 'published' | 'rejected' | 'deleted'

export type SessionFormat = 'in-person' | 'online' | 'phone'

export type VideoOrientation = 'landscape' | 'portrait'

export interface TherapistVideo {
  id: string
  therapist_profile_id: string
  user_id: string
  title: string
  slug: string | null
  description: string | null
  video_url: string
  thumbnail_url: string | null
  duration_seconds: number | null
  session_format: SessionFormat[] | null
  orientation: VideoOrientation
  status: VideoStatus
  view_count: number
  created_at: string
  updated_at: string
  published_at: string | null
}

export interface VideoFeedItem {
  id: string
  slug: string | null
  title: string
  description: string | null
  video_url: string
  thumbnail_url: string | null
  duration_seconds: number | null
  session_format: SessionFormat[] | null
  orientation: VideoOrientation
  created_at: string
  published_at: string | null
  therapist_profile_id: string
  therapist_name: string
  therapist_slug: string | null
  therapist_photo_url: string | null
  therapist_session_format: SessionFormat[] | null
  total_count: number
}

export interface VideoUploadFormData {
  title: string
  description?: string
  session_format?: SessionFormat[]
  video: File
  thumbnail?: File
}

export interface VideoUpdateFormData {
  title: string
  description?: string
  session_format?: SessionFormat[]
}

export const SESSION_FORMAT_LABELS: Record<SessionFormat, string> = {
  'in-person': 'Face to Face',
  'online': 'Online',
  'phone': 'Phone',
}

export const SESSION_FORMAT_ICONS: Record<SessionFormat, string> = {
  'in-person': 'MapPin',
  'online': 'Video',
  'phone': 'Phone',
}

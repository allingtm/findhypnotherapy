/**
 * Cloudflare R2 Storage Types
 */

// Valid storage folders (matching current Supabase bucket structure)
export type StorageFolder =
  | 'profile-photos'
  | 'profile-banners'
  | 'mobile-banners'
  | 'service-images'
  | 'therapist-videos'
  | 'video-thumbnails'
  | 'og-images'

// Options for file upload
export interface UploadOptions {
  contentType?: string
  cacheControl?: string
}

// Result of an upload operation
export interface UploadResult {
  success: boolean
  error?: string
  key?: string
}

// Result of a delete operation
export interface DeleteResult {
  success: boolean
  error?: string
}

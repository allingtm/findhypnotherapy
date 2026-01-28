export const VIDEO_CONSTRAINTS = {
  MAX_FILE_SIZE: 50 * 1024 * 1024, // 50MB
  MAX_DURATION_SECONDS: 90,
  MIN_DURATION_SECONDS: 3,
  ALLOWED_TYPES: ['video/mp4', 'video/webm', 'video/quicktime'] as const,
  ASPECT_RATIO: 16 / 9, // 16:9 landscape
  ASPECT_RATIO_TOLERANCE: 0.1, // Allow 10% variance
}

export const THUMBNAIL_CONSTRAINTS = {
  MAX_FILE_SIZE: 2 * 1024 * 1024, // 2MB
  ALLOWED_TYPES: ['image/jpeg', 'image/png'] as const,
}

export interface ValidationResult {
  valid: boolean
  error?: string
}

export function validateVideoFile(file: File): ValidationResult {
  if (!file) {
    return { valid: false, error: 'No file provided' }
  }

  if (!VIDEO_CONSTRAINTS.ALLOWED_TYPES.includes(file.type as typeof VIDEO_CONSTRAINTS.ALLOWED_TYPES[number])) {
    return {
      valid: false,
      error: `Invalid file type. Allowed types: ${VIDEO_CONSTRAINTS.ALLOWED_TYPES.join(', ')}`,
    }
  }

  if (file.size > VIDEO_CONSTRAINTS.MAX_FILE_SIZE) {
    const maxSizeMB = VIDEO_CONSTRAINTS.MAX_FILE_SIZE / (1024 * 1024)
    return {
      valid: false,
      error: `File size exceeds ${maxSizeMB}MB limit`,
    }
  }

  return { valid: true }
}

export function validateVideoDuration(durationSeconds: number): ValidationResult {
  if (durationSeconds < VIDEO_CONSTRAINTS.MIN_DURATION_SECONDS) {
    return {
      valid: false,
      error: `Video must be at least ${VIDEO_CONSTRAINTS.MIN_DURATION_SECONDS} seconds`,
    }
  }

  if (durationSeconds > VIDEO_CONSTRAINTS.MAX_DURATION_SECONDS) {
    return {
      valid: false,
      error: `Video must be ${VIDEO_CONSTRAINTS.MAX_DURATION_SECONDS} seconds or less`,
    }
  }

  return { valid: true }
}

export function validateVideoAspectRatio(width: number, height: number): ValidationResult {
  const aspectRatio = width / height
  const targetRatio = VIDEO_CONSTRAINTS.ASPECT_RATIO
  const tolerance = VIDEO_CONSTRAINTS.ASPECT_RATIO_TOLERANCE

  if (Math.abs(aspectRatio - targetRatio) > tolerance) {
    return {
      valid: false,
      error: 'Video must be landscape (16:9 aspect ratio)',
    }
  }

  return { valid: true }
}

export function validateThumbnailFile(file: File): ValidationResult {
  if (!file) {
    return { valid: false, error: 'No thumbnail file provided' }
  }

  if (!THUMBNAIL_CONSTRAINTS.ALLOWED_TYPES.includes(file.type as typeof THUMBNAIL_CONSTRAINTS.ALLOWED_TYPES[number])) {
    return {
      valid: false,
      error: `Invalid thumbnail type. Allowed types: ${THUMBNAIL_CONSTRAINTS.ALLOWED_TYPES.join(', ')}`,
    }
  }

  if (file.size > THUMBNAIL_CONSTRAINTS.MAX_FILE_SIZE) {
    const maxSizeMB = THUMBNAIL_CONSTRAINTS.MAX_FILE_SIZE / (1024 * 1024)
    return {
      valid: false,
      error: `Thumbnail size exceeds ${maxSizeMB}MB limit`,
    }
  }

  return { valid: true }
}

export function generateVideoFilename(userId: string, extension: string = 'mp4'): string {
  const timestamp = Date.now()
  return `${userId}/video-${timestamp}.${extension}`
}

export function generateThumbnailFilename(userId: string, videoId: string): string {
  const timestamp = Date.now()
  return `${userId}/${videoId}-thumb-${timestamp}.jpg`
}

export function getVideoExtension(mimeType: string): string {
  const extensions: Record<string, string> = {
    'video/mp4': 'mp4',
    'video/webm': 'webm',
    'video/quicktime': 'mov',
  }
  return extensions[mimeType] || 'mp4'
}

export function formatDuration(seconds: number): string {
  const mins = Math.floor(seconds / 60)
  const secs = Math.floor(seconds % 60)
  return `${mins}:${secs.toString().padStart(2, '0')}`
}

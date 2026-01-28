// File size limit: 5MB
export const MAX_FILE_SIZE = 5 * 1024 * 1024

// Allowed file types
export const ALLOWED_FILE_TYPES = [
  'image/jpeg',
  'image/jpg',
  'image/png'
]

export type FileValidationResult = {
  valid: boolean
  error?: string
}

export function validateImageFile(file: File): FileValidationResult {
  // Check file size
  if (file.size > MAX_FILE_SIZE) {
    return {
      valid: false,
      error: 'File size must be less than 5MB'
    }
  }

  // Check file type
  if (!ALLOWED_FILE_TYPES.includes(file.type)) {
    return {
      valid: false,
      error: 'File must be a JPEG or PNG image'
    }
  }

  return { valid: true }
}

export function getFileExtension(mimeType: string): string {
  const extensions: Record<string, string> = {
    'image/jpeg': 'jpg',
    'image/jpg': 'jpg',
    'image/png': 'png'
  }
  return extensions[mimeType] || 'jpg'
}

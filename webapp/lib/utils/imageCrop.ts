export type Area = {
  x: number
  y: number
  width: number
  height: number
}

/**
 * Converts image to canvas, applies crop, and returns blob
 * Optionally resizes to target dimensions for consistent output sizes
 */
export async function getCroppedImage(
  imageSrc: string,
  pixelCrop: Area,
  outputFormat: 'image/jpeg' | 'image/png' = 'image/jpeg',
  quality: number = 0.9,
  targetWidth?: number,
  targetHeight?: number
): Promise<Blob> {
  const image = await createImage(imageSrc)
  const canvas = document.createElement('canvas')
  const ctx = canvas.getContext('2d')

  if (!ctx) {
    throw new Error('Failed to get canvas context')
  }

  // Use target dimensions if provided, otherwise use crop dimensions
  const outputWidth = targetWidth || pixelCrop.width
  const outputHeight = targetHeight || pixelCrop.height

  // Set canvas size to output size
  canvas.width = outputWidth
  canvas.height = outputHeight

  // Draw cropped image, scaling to target dimensions if needed
  ctx.drawImage(
    image,
    pixelCrop.x,
    pixelCrop.y,
    pixelCrop.width,
    pixelCrop.height,
    0,
    0,
    outputWidth,
    outputHeight
  )

  // Convert to blob
  return new Promise((resolve, reject) => {
    canvas.toBlob(
      (blob) => {
        if (!blob) {
          reject(new Error('Failed to create blob'))
          return
        }
        resolve(blob)
      },
      outputFormat,
      quality
    )
  })
}

/**
 * Creates an image element from source URL
 */
function createImage(url: string): Promise<HTMLImageElement> {
  return new Promise((resolve, reject) => {
    const image = new Image()
    image.addEventListener('load', () => resolve(image))
    image.addEventListener('error', (error) => reject(error))
    image.src = url
  })
}

/**
 * Generates a unique filename for the uploaded photo
 */
export function generatePhotoFilename(userId: string, extension: string): string {
  const timestamp = Date.now()
  return `${userId}/avatar-${timestamp}.${extension}`
}

/**
 * Generates a unique filename for the uploaded banner
 */
export function generateBannerFilename(userId: string, extension: string): string {
  const timestamp = Date.now()
  return `${userId}/banner-${timestamp}.${extension}`
}

/**
 * Generates a unique filename for the mobile banner
 */
export function generateMobileBannerFilename(userId: string, extension: string): string {
  const timestamp = Date.now()
  return `${userId}/mobile-banner-${timestamp}.${extension}`
}

/**
 * Generates a unique filename for an OG (social sharing) image
 */
export function generateOgImageFilename(userId: string, extension: string): string {
  const timestamp = Date.now()
  return `${userId}/og-${timestamp}.${extension}`
}

/**
 * Generates a unique filename for a service image
 */
export function generateServiceImageFilename(
  userId: string,
  serviceId: string,
  extension: string
): string {
  const timestamp = Date.now()
  return `${userId}/service-${serviceId}-${timestamp}.${extension}`
}

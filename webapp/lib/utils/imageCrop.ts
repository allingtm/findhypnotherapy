export type Area = {
  x: number
  y: number
  width: number
  height: number
}

/**
 * Converts image to canvas, applies crop, and returns blob
 */
export async function getCroppedImage(
  imageSrc: string,
  pixelCrop: Area,
  outputFormat: 'image/jpeg' | 'image/png' | 'image/webp' = 'image/webp',
  quality: number = 0.9
): Promise<Blob> {
  const image = await createImage(imageSrc)
  const canvas = document.createElement('canvas')
  const ctx = canvas.getContext('2d')

  if (!ctx) {
    throw new Error('Failed to get canvas context')
  }

  // Set canvas size to cropped size
  canvas.width = pixelCrop.width
  canvas.height = pixelCrop.height

  // Draw cropped image
  ctx.drawImage(
    image,
    pixelCrop.x,
    pixelCrop.y,
    pixelCrop.width,
    pixelCrop.height,
    0,
    0,
    pixelCrop.width,
    pixelCrop.height
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

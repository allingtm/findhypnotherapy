import {
  PutObjectCommand,
  DeleteObjectCommand,
  DeleteObjectsCommand,
  HeadObjectCommand,
} from '@aws-sdk/client-s3'
import { r2Client, R2_BUCKET_NAME, R2_PUBLIC_URL } from './client'
import type { StorageFolder, UploadOptions, UploadResult, DeleteResult } from './types'

/**
 * Upload a file to R2 storage
 *
 * @param folder - The storage folder (e.g., 'profile-photos')
 * @param filename - The filename including any subfolder path (e.g., 'userId/avatar-123.jpg')
 * @param file - The file data as Buffer, Uint8Array, or Blob
 * @param options - Optional upload options (contentType, cacheControl)
 * @returns Upload result with success status and error if failed
 */
export async function uploadFile(
  folder: StorageFolder,
  filename: string,
  file: Buffer | Uint8Array | Blob,
  options?: UploadOptions
): Promise<UploadResult> {
  const key = `${folder}/${filename}`

  try {
    // Convert Blob to Buffer if needed
    let body: Buffer | Uint8Array
    if (file instanceof Blob) {
      const arrayBuffer = await file.arrayBuffer()
      body = Buffer.from(arrayBuffer)
    } else {
      body = file
    }

    const command = new PutObjectCommand({
      Bucket: R2_BUCKET_NAME,
      Key: key,
      Body: body,
      ContentType: options?.contentType,
      CacheControl: options?.cacheControl || 'max-age=3600',
    })

    await r2Client.send(command)

    return { success: true, key }
  } catch (error) {
    console.error('R2 upload error:', error)
    return {
      success: false,
      error: error instanceof Error ? error.message : 'Upload failed',
    }
  }
}

/**
 * Delete a single file from R2 storage
 *
 * @param folder - The storage folder
 * @param filename - The filename including any subfolder path
 * @returns Delete result with success status
 */
export async function deleteFile(
  folder: StorageFolder,
  filename: string
): Promise<DeleteResult> {
  const key = `${folder}/${filename}`

  try {
    const command = new DeleteObjectCommand({
      Bucket: R2_BUCKET_NAME,
      Key: key,
    })

    await r2Client.send(command)

    return { success: true }
  } catch (error) {
    console.error('R2 delete error:', error)
    return {
      success: false,
      error: error instanceof Error ? error.message : 'Delete failed',
    }
  }
}

/**
 * Delete multiple files from R2 storage
 *
 * @param paths - Array of full paths (e.g., ['profile-photos/userId/file.jpg'])
 * @returns Delete result with success status
 */
export async function deleteFiles(paths: string[]): Promise<DeleteResult> {
  if (paths.length === 0) {
    return { success: true }
  }

  try {
    const command = new DeleteObjectsCommand({
      Bucket: R2_BUCKET_NAME,
      Delete: {
        Objects: paths.map((key) => ({ Key: key })),
        Quiet: true,
      },
    })

    await r2Client.send(command)

    return { success: true }
  } catch (error) {
    console.error('R2 batch delete error:', error)
    return {
      success: false,
      error: error instanceof Error ? error.message : 'Batch delete failed',
    }
  }
}

/**
 * Get the public URL for a file
 *
 * @param folder - The storage folder
 * @param filename - The filename including any subfolder path
 * @returns The full public URL
 */
export function getPublicUrl(folder: StorageFolder, filename: string): string {
  return `${R2_PUBLIC_URL}/${folder}/${filename}`
}

/**
 * Check if a file exists in R2 storage
 *
 * @param folder - The storage folder
 * @param filename - The filename including any subfolder path
 * @returns True if file exists, false otherwise
 */
export async function fileExists(
  folder: StorageFolder,
  filename: string
): Promise<boolean> {
  const key = `${folder}/${filename}`

  try {
    const command = new HeadObjectCommand({
      Bucket: R2_BUCKET_NAME,
      Key: key,
    })

    await r2Client.send(command)
    return true
  } catch {
    return false
  }
}

/**
 * Extract the storage path from an R2 public URL
 *
 * @param url - The full public URL
 * @returns The path portion (folder/filename) or null if invalid
 */
export function extractR2Path(url: string): string | null {
  if (!url || !R2_PUBLIC_URL) return null

  // Remove the base URL to get the path
  if (url.startsWith(R2_PUBLIC_URL)) {
    const path = url.slice(R2_PUBLIC_URL.length)
    // Remove leading slash if present
    return path.startsWith('/') ? path.slice(1) : path
  }

  return null
}

/**
 * Extract folder and filename from a full R2 path
 *
 * @param path - The full path (e.g., 'profile-photos/userId/file.jpg')
 * @returns Object with folder and filename, or null if invalid
 */
export function parsePath(path: string): { folder: StorageFolder; filename: string } | null {
  const validFolders: StorageFolder[] = [
    'profile-photos',
    'profile-banners',
    'service-images',
    'therapist-videos',
    'video-thumbnails',
  ]

  for (const folder of validFolders) {
    if (path.startsWith(`${folder}/`)) {
      return {
        folder,
        filename: path.slice(folder.length + 1),
      }
    }
  }

  return null
}

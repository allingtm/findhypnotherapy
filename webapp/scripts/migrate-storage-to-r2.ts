/**
 * Migration Script: Supabase Storage → Cloudflare R2
 *
 * This script migrates all existing files from Supabase Storage to Cloudflare R2
 * and updates the database URLs accordingly.
 *
 * Usage:
 *   npx tsx scripts/migrate-storage-to-r2.ts
 *
 * Prerequisites:
 *   - R2 bucket must be created and configured
 *   - Environment variables must be set (R2_*, SUPABASE_*)
 *
 * What it does:
 *   1. Fetches all file URLs from the database
 *   2. Downloads each file from Supabase Storage
 *   3. Uploads to R2 with the same path structure
 *   4. Updates the database with new R2 URLs
 */

import { createClient } from '@supabase/supabase-js'
import { S3Client, PutObjectCommand } from '@aws-sdk/client-s3'

// Load environment variables
const SUPABASE_URL = process.env.NEXT_PUBLIC_SUPABASE_URL!
const SUPABASE_SERVICE_KEY = process.env.SUPABASE_SERVICE_ROLE_KEY!
const R2_ACCOUNT_ID = process.env.R2_ACCOUNT_ID!
const R2_ACCESS_KEY_ID = process.env.R2_ACCESS_KEY_ID!
const R2_SECRET_ACCESS_KEY = process.env.R2_SECRET_ACCESS_KEY!
const R2_BUCKET_NAME = process.env.R2_BUCKET_NAME!
const R2_PUBLIC_URL = process.env.R2_PUBLIC_URL!

// Validate environment variables
const requiredEnvVars = [
  'NEXT_PUBLIC_SUPABASE_URL',
  'SUPABASE_SERVICE_ROLE_KEY',
  'R2_ACCOUNT_ID',
  'R2_ACCESS_KEY_ID',
  'R2_SECRET_ACCESS_KEY',
  'R2_BUCKET_NAME',
  'R2_PUBLIC_URL',
]

for (const envVar of requiredEnvVars) {
  if (!process.env[envVar]) {
    console.error(`Missing required environment variable: ${envVar}`)
    process.exit(1)
  }
}

// Initialize clients
const supabase = createClient(SUPABASE_URL, SUPABASE_SERVICE_KEY)

const r2Client = new S3Client({
  region: 'auto',
  endpoint: `https://${R2_ACCOUNT_ID}.r2.cloudflarestorage.com`,
  credentials: {
    accessKeyId: R2_ACCESS_KEY_ID,
    secretAccessKey: R2_SECRET_ACCESS_KEY,
  },
})

// Bucket mapping from Supabase to R2 folder
const BUCKET_MAPPING: Record<string, string> = {
  'profile-photos': 'profile-photos',
  'profile-banners': 'profile-banners',
  'service-images': 'service-images',
  'therapist-videos': 'therapist-videos',
  'video-thumbnails': 'video-thumbnails',
  'profile-videos': 'therapist-videos', // Legacy bucket name
}

interface MigrationResult {
  table: string
  column: string
  id: string
  oldUrl: string
  newUrl: string | null
  status: 'success' | 'skipped' | 'error'
  error?: string
}

const results: MigrationResult[] = []

/**
 * Extract bucket and path from Supabase Storage URL
 */
function parseSupabaseUrl(url: string): { bucket: string; path: string } | null {
  // URL format: https://xxx.supabase.co/storage/v1/object/public/bucket-name/path/to/file
  const match = url.match(/\/storage\/v1\/object\/public\/([^/]+)\/(.+)$/)
  if (!match) return null
  return { bucket: match[1], path: match[2] }
}

/**
 * Download file from Supabase Storage
 */
async function downloadFromSupabase(bucket: string, path: string): Promise<Buffer | null> {
  try {
    const { data, error } = await supabase.storage.from(bucket).download(path)
    if (error || !data) {
      console.error(`Failed to download ${bucket}/${path}:`, error?.message)
      return null
    }
    const arrayBuffer = await data.arrayBuffer()
    return Buffer.from(arrayBuffer)
  } catch (err) {
    console.error(`Error downloading ${bucket}/${path}:`, err)
    return null
  }
}

/**
 * Upload file to R2
 */
async function uploadToR2(
  folder: string,
  filename: string,
  data: Buffer,
  contentType?: string
): Promise<boolean> {
  try {
    const key = `${folder}/${filename}`
    const command = new PutObjectCommand({
      Bucket: R2_BUCKET_NAME,
      Key: key,
      Body: data,
      ContentType: contentType || 'application/octet-stream',
      CacheControl: 'max-age=3600',
    })
    await r2Client.send(command)
    return true
  } catch (err) {
    console.error(`Error uploading to R2:`, err)
    return false
  }
}

/**
 * Get R2 public URL
 */
function getR2PublicUrl(folder: string, filename: string): string {
  return `${R2_PUBLIC_URL}/${folder}/${filename}`
}

/**
 * Migrate a single file
 */
async function migrateFile(
  table: string,
  column: string,
  id: string,
  url: string
): Promise<MigrationResult> {
  const result: MigrationResult = {
    table,
    column,
    id,
    oldUrl: url,
    newUrl: null,
    status: 'error',
  }

  // Skip if already an R2 URL
  if (url.startsWith(R2_PUBLIC_URL)) {
    result.status = 'skipped'
    result.newUrl = url
    return result
  }

  // Parse Supabase URL
  const parsed = parseSupabaseUrl(url)
  if (!parsed) {
    result.error = 'Invalid Supabase URL format'
    return result
  }

  // Get R2 folder from bucket mapping
  const r2Folder = BUCKET_MAPPING[parsed.bucket]
  if (!r2Folder) {
    result.error = `Unknown bucket: ${parsed.bucket}`
    return result
  }

  // Download from Supabase
  console.log(`  Downloading: ${parsed.bucket}/${parsed.path}`)
  const fileData = await downloadFromSupabase(parsed.bucket, parsed.path)
  if (!fileData) {
    result.error = 'Failed to download from Supabase'
    return result
  }

  // Determine content type from extension
  const ext = parsed.path.split('.').pop()?.toLowerCase()
  const contentTypeMap: Record<string, string> = {
    jpg: 'image/jpeg',
    jpeg: 'image/jpeg',
    png: 'image/png',
    webp: 'image/webp',
    gif: 'image/gif',
    mp4: 'video/mp4',
    webm: 'video/webm',
    mov: 'video/quicktime',
  }
  const contentType = ext ? contentTypeMap[ext] : undefined

  // Upload to R2
  console.log(`  Uploading to R2: ${r2Folder}/${parsed.path}`)
  const uploaded = await uploadToR2(r2Folder, parsed.path, fileData, contentType)
  if (!uploaded) {
    result.error = 'Failed to upload to R2'
    return result
  }

  // Generate new URL
  result.newUrl = getR2PublicUrl(r2Folder, parsed.path)
  result.status = 'success'
  return result
}

/**
 * Update database with new URL
 */
async function updateDatabaseUrl(
  table: string,
  column: string,
  id: string,
  newUrl: string
): Promise<boolean> {
  try {
    const { error } = await supabase
      .from(table)
      .update({ [column]: newUrl })
      .eq('id', id)

    if (error) {
      console.error(`Failed to update ${table}.${column} for id ${id}:`, error.message)
      return false
    }
    return true
  } catch (err) {
    console.error(`Error updating database:`, err)
    return false
  }
}

/**
 * Migrate all files for a specific table and column
 */
async function migrateTableColumn(
  table: string,
  column: string,
  idColumn: string = 'id'
): Promise<void> {
  console.log(`\nMigrating ${table}.${column}...`)

  // Fetch all records with non-null URLs
  const { data: records, error } = await supabase
    .from(table)
    .select('*')
    .not(column, 'is', null)

  if (error) {
    console.error(`Failed to fetch ${table}:`, error.message)
    return
  }

  if (!records || records.length === 0) {
    console.log(`  No records to migrate`)
    return
  }

  console.log(`  Found ${records.length} records to migrate`)

  for (const record of records) {
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const rec = record as any
    const id = rec[idColumn] as string
    const url = rec[column] as string

    if (!url) continue

    console.log(`  Processing ${id}...`)
    const result = await migrateFile(table, column, id, url)
    results.push(result)

    if (result.status === 'success' && result.newUrl) {
      const updated = await updateDatabaseUrl(table, column, id, result.newUrl)
      if (!updated) {
        result.status = 'error'
        result.error = 'Failed to update database'
      }
    }

    // Log result
    if (result.status === 'success') {
      console.log(`    ✓ Migrated successfully`)
    } else if (result.status === 'skipped') {
      console.log(`    - Skipped (already migrated)`)
    } else {
      console.log(`    ✗ Error: ${result.error}`)
    }
  }
}

/**
 * Main migration function
 */
async function migrate(): Promise<void> {
  console.log('='.repeat(60))
  console.log('Starting Supabase → R2 Storage Migration')
  console.log('='.repeat(60))

  // Migrate each table/column
  await migrateTableColumn('users', 'photo_url')
  await migrateTableColumn('therapist_profiles', 'banner_url')
  await migrateTableColumn('therapist_services', 'image_url')
  await migrateTableColumn('therapist_videos', 'video_url')
  await migrateTableColumn('therapist_videos', 'thumbnail_url')

  // Print summary
  console.log('\n' + '='.repeat(60))
  console.log('Migration Summary')
  console.log('='.repeat(60))

  const successful = results.filter((r) => r.status === 'success').length
  const skipped = results.filter((r) => r.status === 'skipped').length
  const failed = results.filter((r) => r.status === 'error').length

  console.log(`Total processed: ${results.length}`)
  console.log(`  ✓ Successful: ${successful}`)
  console.log(`  - Skipped: ${skipped}`)
  console.log(`  ✗ Failed: ${failed}`)

  if (failed > 0) {
    console.log('\nFailed migrations:')
    results
      .filter((r) => r.status === 'error')
      .forEach((r) => {
        console.log(`  ${r.table}.${r.column} (${r.id}): ${r.error}`)
      })
  }

  console.log('\nMigration complete!')
}

// Run migration
migrate().catch((err) => {
  console.error('Migration failed:', err)
  process.exit(1)
})

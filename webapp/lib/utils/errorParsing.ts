/**
 * Error Parsing Utilities for Server Actions
 *
 * Handles various error formats that may result from Next.js 15 / React 19
 * serialization issues between server actions and client components.
 */

type ErrorValue = unknown

/**
 * Parse a single error value into a clean string message
 *
 * Handles multiple formats:
 * - Plain strings
 * - Stringified JSON arrays: '[{"message":"..."}]'
 * - Stringified JSON objects: '{"message":"..."}'
 * - Zod error objects with .errors[0].message
 *
 * @param error - The error value to parse
 * @returns Clean error message string or undefined
 */
export function parseServerError(error: ErrorValue): string | undefined {
  // Already undefined/null
  if (error == null) return undefined

  // Already a clean string
  if (typeof error === 'string') {
    // Check if it's stringified JSON
    const trimmed = error.trim()

    // Array format: '[{"message":"..."}]' or '[...]'
    if (trimmed.startsWith('[') && trimmed.endsWith(']')) {
      try {
        const parsed = JSON.parse(trimmed)
        if (Array.isArray(parsed) && parsed.length > 0) {
          // Try to extract message from first element
          const first = parsed[0]
          if (typeof first === 'string') return first
          if (first?.message) return String(first.message)
        }
      } catch {
        // Not valid JSON, might be a legit string like "[important note]"
        return error
      }
    }

    // Object format: '{"message":"..."}'
    if (trimmed.startsWith('{') && trimmed.endsWith('}')) {
      try {
        const parsed = JSON.parse(trimmed)
        if (parsed?.message) return String(parsed.message)
      } catch {
        // Not valid JSON
        return error
      }
    }

    // Regular string
    return error
  }

  // Object with message property (Zod error format)
  if (typeof error === 'object' && error !== null) {
    // Direct message property
    if ('message' in error && typeof error.message === 'string') {
      return error.message
    }

    // Zod error format with errors array
    if ('errors' in error && Array.isArray((error as any).errors)) {
      const zodError = (error as any).errors[0]
      if (zodError?.message) return String(zodError.message)
    }
  }

  // Fallback - log unexpected format in development
  if (process.env.NODE_ENV === 'development') {
    console.warn('[parseServerError] Unknown error format:', {
      type: typeof error,
      value: error
    })
  }

  return undefined
}

/**
 * Parse field errors from server action response
 *
 * Handles Record<string, unknown> where values might be:
 * - string[] (correct format)
 * - string (stringified array)
 * - any other malformed format
 *
 * @param fieldErrors - The fieldErrors object from server action response
 * @param fieldName - The specific field to extract errors for
 * @param clientError - Optional client-side validation error to fall back to
 * @returns Clean error message string or undefined
 */
export function parseFieldErrors(
  fieldErrors: Record<string, unknown> | undefined,
  fieldName: string,
  clientError?: string
): string | undefined {
  // Prefer server error over client error
  const serverError = fieldErrors?.[fieldName]

  if (serverError !== undefined) {
    // Array format (expected)
    if (Array.isArray(serverError)) {
      if (serverError.length > 0) {
        return parseServerError(serverError[0])
      }
    } else {
      // Single value (might be stringified)
      const parsed = parseServerError(serverError)
      if (parsed) {
        // Log unexpected format in development
        if (process.env.NODE_ENV === 'development') {
          console.warn('[parseFieldErrors] Unexpected non-array format:', {
            field: fieldName,
            receivedType: typeof serverError,
            receivedValue: serverError,
            parsedResult: parsed
          })
        }
        return parsed
      }
    }
  }

  // Fallback to client error
  return clientError
}

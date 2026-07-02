import { logger } from './logger';

/**
 * Utility to extract and parse JSON from a model output text,
 * stripping markdown code fences or surrounding text if present.
 */
export function parseJSONResponse<T>(text: string, defaultValue: T): T {
  if (!text) return defaultValue;

  let cleaned = text.trim();

  // Strip markdown formatting if present
  if (cleaned.startsWith('```json')) {
    cleaned = cleaned.substring(7);
  } else if (cleaned.startsWith('```')) {
    cleaned = cleaned.substring(3);
  }

  if (cleaned.endsWith('```')) {
    cleaned = cleaned.substring(0, cleaned.length - 3);
  }

  cleaned = cleaned.trim();

  // If there are stray characters before the first '{' or after the last '}', trim them.
  const startIdx = cleaned.indexOf('{');
  const endIdx = cleaned.lastIndexOf('}');
  if (startIdx !== -1 && endIdx !== -1 && endIdx > startIdx) {
    cleaned = cleaned.substring(startIdx, endIdx + 1);
  } else {
    // Check if it's an array response (e.g. resolver matches list)
    const arrStart = cleaned.indexOf('[');
    const arrEnd = cleaned.lastIndexOf(']');
    if (arrStart !== -1 && arrEnd !== -1 && arrEnd > arrStart) {
      cleaned = cleaned.substring(arrStart, arrEnd + 1);
    }
  }

  try {
    return JSON.parse(cleaned) as T;
  } catch (error: any) {
    logger.error(`[PARSER] Failed to parse JSON from text: ${cleaned.substring(0, 100)}...`, error);
    return defaultValue;
  }
}

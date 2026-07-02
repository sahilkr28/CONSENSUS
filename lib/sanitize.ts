import { logger } from './logger';

const INJECTION_PATTERNS = [
  /ignore\s+previous\s+instructions/i,
  /ignore\s+above/i,
  /ignore\s+below/i,
  /system\s+override/i,
  /you\s+are\s+now\s+a/i,
  /acting\s+as\s+a/i,
  /disregard\s+prior/i,
  /bypass\s+restrictions/i,
  /do\s+not\s+follow/i,
  /new\s+instructions/i,
  /ignore\s+the\s+rule/i,
  /forget\s+what\s+I\s+said/i,
  /assistant\s+override/i,
];

/**
 * Checks if a string contains potential prompt-injection patterns.
 * If found, logs a warning and returns true.
 */
export function detectInjection(text: string): boolean {
  if (!text) return false;
  for (const pattern of INJECTION_PATTERNS) {
    if (pattern.test(text)) {
      logger.warn(`[SECURITY] Prompt injection pattern detected: ${pattern.toString()}`);
      return true;
    }
  }
  return false;
}

/**
 * Sanitizes input text to neutralize prompt injection attempts.
 * Replaces offensive keywords with benign representations.
 */
export function sanitizeInput(text: string): string {
  if (!text) return '';
  let sanitized = text;

  // Let's replace common injection sequences with sanitized warnings
  for (const pattern of INJECTION_PATTERNS) {
    if (pattern.test(sanitized)) {
      sanitized = sanitized.replace(pattern, '[REDACTED INJECTION ATTEMPT]');
    }
  }

  // Remove potential dangerous character structures or tag close bypasses
  sanitized = sanitized.replace(/<\/retrieved_evidence>/gi, '[ESC_TAG]');
  
  return sanitized;
}

/**
 * Wraps retrieved content in evidence tags to segregate data from prompt instructions.
 */
export function wrapInEvidenceTags(content: string): string {
  const sanitized = sanitizeInput(content);
  return `<retrieved_evidence>\n${sanitized}\n</retrieved_evidence>`;
}

import { callLLM } from '../lib/llm';
import { logger } from '../lib/logger';
import { sanitizeInput } from '../lib/sanitize';
import { parseJSONResponse } from '../lib/parser';
import { z } from 'zod';

/**
 * Executes a structured call to Gemini for a specific agent.
 * Enforces JSON response types, sanitizes input prompts,
 * parses and validates result schemas, and logs token/latency metrics.
 */
export async function executeAgentCall<T>(
  agentName: string,
  systemPrompt: string,
  userPrompt: string,
  schema: z.ZodSchema<T>,
  fallbackValue: T
): Promise<{ result: T; promptTokens: number; completionTokens: number; durationMs: number }> {
  const startTime = Date.now();
  
  // Sanitize both system and user prompts to neutralize any injection attempts.
  const sanitizedSystem = systemPrompt; // Keep system prompt unaltered since it's internal/static
  const sanitizedUser = sanitizeInput(userPrompt);

  // Append a strict instruction to return raw JSON matching schema shape
  const finalSystemPrompt = `${sanitizedSystem}\n\nIMPORTANT: You must return ONLY a raw JSON block. Do not wrap the JSON in markdown code blocks, do not add introductory text, and do not add trailing explanations. Output strict JSON.`;

  logger.info(`[AGENT] Starting execution for: ${agentName}`);
  
  try {
    const { text, promptTokens, completionTokens } = await callLLM(finalSystemPrompt, sanitizedUser, {
      temperature: 0.1, // low temperature for analytical consistency
      responseMimeType: 'application/json',
    });

    const parsedJson = parseJSONResponse(text, fallbackValue);
    
    // Validate output with Zod
    const validationResult = schema.safeParse(parsedJson);
    const durationMs = Date.now() - startTime;

    if (!validationResult.success) {
      logger.warn(`[AGENT] Schema validation failed for agent: ${agentName}. Errors: ${JSON.stringify(validationResult.error.format())}. Falling back to default values.`);
      logger.logNodeExecution(agentName, 'warning', durationMs, { promptTokens, completionTokens }, 'Schema validation failed');
      return {
        result: fallbackValue,
        promptTokens,
        completionTokens,
        durationMs,
      };
    }

    logger.logNodeExecution(agentName, 'completed', durationMs, { promptTokens, completionTokens });
    return {
      result: validationResult.data,
      promptTokens,
      completionTokens,
      durationMs,
    };
  } catch (error: any) {
    const durationMs = Date.now() - startTime;
    logger.error(`[AGENT] Execution error in agent ${agentName}: ${error.message}`, error);
    logger.logNodeExecution(agentName, 'failed', durationMs, undefined, error.message);
    
    return {
      result: fallbackValue,
      promptTokens: 0,
      completionTokens: 0,
      durationMs,
    };
  }
}

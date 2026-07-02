import { GoogleGenerativeAI } from '@google/generative-ai';
import { logger } from './logger';

// Check for the GEMINI_API_KEY environment variable.
const GEMINI_API_KEY = process.env.GEMINI_API_KEY || '';

// Swappable LLM Provider configuration.
// To change the provider (e.g. OpenAI, Anthropic, Groq, Ollama),
// rewrite this module or swap the function implementations below.
export type Provider = 'gemini' | 'openai' | 'anthropic' | 'groq' | 'ollama';
const CURRENT_PROVIDER: Provider = 'gemini';

const getGeminiClient = () => {
  if (!GEMINI_API_KEY) {
    logger.warn('GEMINI_API_KEY is not defined in the environment variables.');
  }
  return new GoogleGenerativeAI(GEMINI_API_KEY);
};

/**
 * Main LLM invocation method. Swappable behind this interface.
 * Implements exponential backoff retry mechanism (2 retries).
 */
export async function callLLM(
  systemPrompt: string,
  userPrompt: string,
  options: {
    temperature?: number;
    responseMimeType?: string;
    maxTokens?: number;
  } = {}
): Promise<{ text: string; promptTokens: number; completionTokens: number }> {
  let retries = 5;
  let delay = 1200;

  while (retries >= 0) {
    try {
      const startTime = Date.now();
      let resultText = '';
      let promptTokens = 0;
      let completionTokens = 0;

      if (CURRENT_PROVIDER === 'gemini') {
        const ai = getGeminiClient();
        const model = ai.getGenerativeModel({
          model: 'gemini-3.1-flash-lite',
          generationConfig: {
            temperature: options.temperature ?? 0.2,
            responseMimeType: options.responseMimeType,
            maxOutputTokens: options.maxTokens,
          },
          systemInstruction: systemPrompt,
        });

        const result = await model.generateContent(userPrompt);
        resultText = result.response.text();
        
        // Approximate token counting since native billing counts aren't always returned directly
        promptTokens = Math.ceil((systemPrompt.length + userPrompt.length) / 4);
        completionTokens = Math.ceil(resultText.length / 4);
      } else if (CURRENT_PROVIDER === 'openai') {
        // Example for swapping to OpenAI:
        // const response = await openai.chat.completions.create({
        //   model: 'gpt-4o',
        //   messages: [{ role: 'system', content: systemPrompt }, { role: 'user', content: userPrompt }],
        //   temperature: options.temperature,
        // });
        // resultText = response.choices[0].message.content;
        throw new Error('OpenAI provider not implemented.');
      } else if (CURRENT_PROVIDER === 'anthropic') {
        // Example for Anthropic Claude:
        throw new Error('Anthropic provider not implemented.');
      } else {
        throw new Error(`Provider ${CURRENT_PROVIDER} is not supported yet.`);
      }

      const duration = Date.now() - startTime;
      logger.info(`[LLM] Success call to ${CURRENT_PROVIDER} | Latency: ${duration}ms | Est. Tokens: Prompt ${promptTokens}, Completion ${completionTokens}`);
      
      return {
        text: resultText,
        promptTokens,
        completionTokens,
      };
    } catch (error: any) {
      if (retries === 0) {
        logger.error(`[LLM] Call failed after retries. Error: ${error.message}`, error);
        throw error;
      }

      const isRateLimit = error.message?.includes('429') || 
                          error.message?.includes('Too Many Requests') ||
                          error.message?.includes('quota');

      const waitTime = isRateLimit ? Math.max(delay * 3, 5000) : delay;
      logger.warn(`[LLM] Call failed. Retrying... (${retries} retries left). Waiting ${waitTime}ms. Error: ${error.message}`);
      
      await new Promise((resolve) => setTimeout(resolve, waitTime));
      retries--;
      delay *= 2.5; // exponential backoff
    }
  }

  throw new Error('LLM call failed');
}

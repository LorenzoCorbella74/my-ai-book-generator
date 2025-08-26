
import { generateObject } from 'ai';
import { z } from 'zod';

// Ollama
import { ollama } from 'ollama-ai-provider-v2';
import { google } from '@ai-sdk/google';

export async function generate<T>(
  prompt: string,
  schema: z.ZodType<T>,
  model: string = '',
  system?: string
) {
  // Prefer Google Gemini if API key is present, else fallback to Ollama
  const useGoogle = !!process.env.GOOGLE_GENERATIVE_AI_API_KEY;
  let providerModel;
  if (useGoogle) {
    providerModel = google('gemini-2.5-flash');
    console.log('Using Google Gemini 2.5 Flash');
  } else {
    // fallback to ollama, use default or passed model string
    const modelStr = model || 'ollama:llama3.2:latest';
    const [provider, modelId, dimension] = modelStr.split(':');
    if (provider !== 'ollama') {
      throw new Error('Only Ollama provider is supported as fallback');
    }
    providerModel = ollama(modelId + (dimension ? `:${dimension}` : ''));
    console.log('Using Ollama', modelId + (dimension ? `:${dimension}` : ''));
  }

  console.log('Prompt: ', prompt);

  const { object } = await generateObject({
    model: providerModel,
    prompt,
    schema,
    system,
    temperature: 0.9,
    maxTokens: 10000,
  });

  return object;
}


import { generateObject } from 'ai';
import { z } from 'zod';

// Providers
import { ollama } from 'ollama-ai-provider-v2';
import { google } from '@ai-sdk/google';
import { openai } from '@ai-sdk/openai';
import { mistral } from '@ai-sdk/mistral';

export async function generate<T>(
  prompt: string,
  schema: z.ZodType<T>,
  model: string = '', // This parameter is now only for the default ollama model
  system?: string
) {
  let providerModel;

  // Provider selection based on environment variables
  if (process.env.OPENAI_API_KEY && process.env.OPENAI_MODEL) {
    providerModel = openai(process.env.OPENAI_MODEL);
    console.log(`Using OpenAI model: ${process.env.OPENAI_MODEL}`);
  } else if (process.env.MISTRAL_API_KEY && process.env.MISTRAL_MODEL) {
    providerModel = mistral(process.env.MISTRAL_MODEL);
    console.log(`Using Mistral model: ${process.env.MISTRAL_MODEL}`);
  } else if (process.env.GOOGLE_GENERATIVE_AI_API_KEY && process.env.GOOGLE_MODEL) {
    providerModel = google(process.env.GOOGLE_MODEL);
    console.log(`Using Google Gemini model: ${process.env.GOOGLE_MODEL}`);
  } else {
    // Fallback to Ollama
    const modelStr = model || 'ollama:llama3.2:latest';
    const [provider, modelId, dimension] = modelStr.split(':');
    if (provider !== 'ollama') {
      throw new Error('Only Ollama provider is supported as fallback');
    }
    providerModel = ollama(modelId + (dimension ? `:${dimension}` : ''));
    console.log(`Using Ollama model: ${modelId + (dimension ? `:${dimension}` : '')}`);
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

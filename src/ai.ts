
import { generateObject } from 'ai';
import { z } from 'zod';

// Providers
import { ollama } from 'ollama-ai-provider-v2';
import { google } from '@ai-sdk/google';
import { openai } from '@ai-sdk/openai';
import { mistral } from '@ai-sdk/mistral';
import { anthropic } from '@ai-sdk/anthropic';

export async function generate<T>(
  prompt: string,
  schema: z.ZodType<T>,
  system?: string
) {
  let providerModel;

  // Provider selection based on environment variables
  if (process.env.OPENAI_API_KEY && process.env.OPENAI_MODEL) {
    providerModel = openai(process.env.OPENAI_MODEL);
    console.log(`Using OpenAI model: ${process.env.OPENAI_MODEL}`);
  } else if (process.env.ANTHROPIC_API_KEY && process.env.ANTHROPIC_MODEL) {
    providerModel = anthropic(process.env.ANTHROPIC_MODEL);
    console.log(`Using Anthropic model: ${process.env.ANTHROPIC_MODEL}`);
  } else if (process.env.MISTRAL_API_KEY && process.env.MISTRAL_MODEL) {
    providerModel = mistral(process.env.MISTRAL_MODEL);
    console.log(`Using Mistral model: ${process.env.MISTRAL_MODEL}`);
  } else if (process.env.GOOGLE_GENERATIVE_AI_API_KEY && process.env.GOOGLE_MODEL) {
    providerModel = google(process.env.GOOGLE_MODEL);
    console.log(`Using Google Gemini model: ${process.env.GOOGLE_MODEL}`);
  } else {
    // Fallback to Ollama
    const ollamaModel = process.env.OLLAMA_MODEL || 'llama3.2:latest';
    providerModel = ollama(ollamaModel);
    console.log(`Using Ollama model: ${ollamaModel}`);
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

import { ollama } from 'ollama-ai-provider-v2';
import { generateObject } from 'ai';
import { z } from 'zod';

export async function generate<T>(
    prompt: string, 
    schema: z.ZodType<T>,
    model: string = 'ollama:llama3.2:latest',
    system?: string
    ) {
  const [provider, modelId, dimension] = model.split(':');

  if (provider !== 'ollama') {
    throw new Error('Only Ollama provider is supported');
  }

  const { object } = await generateObject({
    model: ollama(modelId + (dimension ? `:${dimension}` : '')),
    prompt,
    schema,
    system,
    temperature: 0.9,
    maxTokens: 10000,
  });

  return object;
}

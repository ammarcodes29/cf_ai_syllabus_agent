/**
 * AI Module - Cloudflare Workers AI Integration
 */

interface Env {
  AI: Ai;
}

export interface LLMOptions {
  systemPrompt?: string;
  temperature?: number;
  maxTokens?: number;
}

/**
 * Run LLM inference using Cloudflare Workers AI
 * @param prompt - The user prompt to send to the LLM
 * @param env - Cloudflare environment with AI binding
 * @param options - Optional configuration for the LLM
 * @returns The LLM response as a string
 */
export async function runLLM(
  prompt: string,
  env: Env,
  options: LLMOptions = {}
): Promise<string> {
  const {
    systemPrompt = 'You are a helpful assistant.',
    temperature = 0.7,
    maxTokens = 2048,
  } = options;

  console.log('[runLLM] Starting AI request, prompt length:', prompt.length);
  console.log('[runLLM] System prompt:', systemPrompt?.substring(0, 100) + '...');

  const messages = [];

  // Add system prompt if provided
  if (systemPrompt) {
    messages.push({
      role: 'system',
      content: systemPrompt,
    });
  }

  // Add user prompt
  messages.push({
    role: 'user',
    content: prompt,
  });

  try {
    console.log('[runLLM] Calling AI.run...');
    const response = await env.AI.run('@cf/meta/llama-3.3-70b-instruct-fp8-fast', {
      messages,
      temperature,
      max_tokens: maxTokens,
    });

    console.log('[runLLM] AI response received:', typeof response);
    console.log('[runLLM] Response keys:', Object.keys(response as any));
    
    // Extract text from response
    if (response && typeof response === 'object' && 'response' in response) {
      const text = (response as { response: string }).response;
      console.log('[runLLM] Extracted text, length:', text.length);
      return text;
    }

    // Fallback for different response structures
    if (typeof response === 'string') {
      console.log('[runLLM] Response is string, length:', response.length);
      return response;
    }

    console.error('[runLLM] Unexpected response format:', JSON.stringify(response));
    throw new Error('Unexpected response format from AI');
  } catch (error: any) {
    console.error('[runLLM] Error:', error);
    console.error('[runLLM] Error message:', error.message);
    console.error('[runLLM] Error stack:', error.stack);
    throw error;
  }
}

/**
 * Run LLM with streaming support
 * Note: Streaming implementation for future enhancement
 */
export async function runLLMStream(
  prompt: string,
  env: Env,
  options: LLMOptions = {}
): Promise<ReadableStream> {
  const {
    systemPrompt = 'You are a helpful assistant.',
    temperature = 0.7,
    maxTokens = 2048,
  } = options;

  const messages = [];

  if (systemPrompt) {
    messages.push({
      role: 'system',
      content: systemPrompt,
    });
  }

  messages.push({
    role: 'user',
    content: prompt,
  });

  const response = await env.AI.run(
    '@cf/meta/llama-3.3-70b-instruct-fp8-fast',
    {
      messages,
      temperature,
      max_tokens: maxTokens,
      stream: true,
    }
  );

  return response as ReadableStream;
}


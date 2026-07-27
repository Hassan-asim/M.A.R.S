export interface Message {
  role: 'system' | 'user' | 'assistant';
  content: string;
}

const FREE_MODELS = [
  'meta-llama/llama-3.3-70b-instruct:free',
  'deepseek/deepseek-r1:free',
  'meta-llama/llama-3.1-8b-instruct:free',
  'qwen/qwen-2.5-coder-32b-instruct:free',
  'mistralai/mistral-7b-instruct:free',
  'google/gemini-2.0-flash-exp:free',
];

/**
 * Retrieves the pool of available OpenRouter API keys from environment variables.
 */
function getApiKeyPool(): string[] {
  const keys: string[] = [];
  const key1 = process.env.OPENROUTER_API_KEY_1;
  const key2 = process.env.OPENROUTER_API_KEY_2;
  const key3 = process.env.OPENROUTER_API_KEY_3;
  const key4 = process.env.OPENROUTER_API_KEY_4;
  const keyDefault = process.env.OPENROUTER_API_KEY;

  if (key1) keys.push(key1);
  if (key2) keys.push(key2);
  if (key3) keys.push(key3);
  if (key4) keys.push(key4);
  if (keyDefault && !keys.includes(keyDefault)) keys.push(keyDefault);

  return keys;
}

/**
 * Calls OpenRouter using free models with preferred API key distribution and automatic key failover.
 *
 * @param messages Array of chat messages
 * @param preferredKeyIndex Optional 1-based index (1-4) for assigning specific keys to specific agents
 * @param temperature Model sampling temperature
 */
export async function callOpenRouter(
  messages: Message[],
  preferredKeyIndex?: number,
  temperature = 0.7
): Promise<string> {
  const keyPool = getApiKeyPool();

  if (keyPool.length === 0) {
    throw new Error(
      'No OpenRouter API key found in environment variables (OPENROUTER_API_KEY_1..4 or OPENROUTER_API_KEY).'
    );
  }

  // Order keys so preferred key comes first, followed by remaining keys as fallbacks
  let orderedKeys: string[] = [];

  if (preferredKeyIndex && preferredKeyIndex >= 1 && preferredKeyIndex <= 4) {
    const preferredKey = process.env[`OPENROUTER_API_KEY_${preferredKeyIndex}`];
    if (preferredKey) {
      orderedKeys.push(preferredKey);
    }
  }

  // Add any remaining keys from pool
  for (const k of keyPool) {
    if (!orderedKeys.includes(k)) {
      orderedKeys.push(k);
    }
  }

  let lastError: any = null;

  for (const model of FREE_MODELS) {
    // CRITICAL REQUIREMENT: Model ID must end with :free to avoid paid charges
    if (!model.endsWith(':free')) {
      continue;
    }

    for (const apiKey of orderedKeys) {
      try {
        const response = await fetch('https://openrouter.ai/api/v1/chat/completions', {
          method: 'POST',
          headers: {
            'Authorization': `Bearer ${apiKey}`,
            'HTTP-Referer': process.env.OPENROUTER_SITE_URL || 'https://mars-research.vercel.app',
            'X-Title': process.env.OPENROUTER_SITE_NAME || 'M.A.R.S',
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({
            model,
            messages,
            temperature,
          }),
        });

        if (!response.ok) {
          const errorText = await response.text();
          console.warn(
            `OpenRouter model ${model} with key ending ...${apiKey.slice(-6)} failed (${response.status}): ${errorText}`
          );
          lastError = new Error(`OpenRouter API error ${response.status}: ${errorText}`);
          // Try next API key in pool
          continue;
        }

        const data = await response.json();
        const content = data.choices?.[0]?.message?.content;
        if (content && typeof content === 'string') {
          return content.trim();
        }
      } catch (err) {
        console.warn(`Fetch error for OpenRouter model ${model}:`, err);
        lastError = err;
      }
    }
  }

  throw lastError || new Error('All free OpenRouter model calls and API key attempts failed.');
}

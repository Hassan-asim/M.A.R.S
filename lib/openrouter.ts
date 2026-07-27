export interface Message {
  role: 'system' | 'user' | 'assistant';
  content: string;
}

function getApiKeyPool(): string[] {
  const keys: string[] = [];
  const deepseek1 = process.env.DEEPSEEK_API_KEY_1;
  const deepseek2 = process.env.DEEPSEEK_API_KEY_2;
  const glmKey = process.env.GLM_API_KEY;

  if (deepseek1) keys.push(deepseek1);
  if (deepseek2) keys.push(deepseek2);
  if (glmKey) keys.push(glmKey);

  return keys;
}

async function tryProviderCall(
  endpoint: string,
  model: string,
  apiKey: string,
  messages: Message[],
  temperature: number,
  provider: 'deepseek' | 'glm'
): Promise<string | null> {
  const headers: Record<string, string> = {
    'Content-Type': 'application/json',
  };

  if (provider === 'deepseek') {
    headers.Authorization = `Bearer ${apiKey}`;
  } else {
    headers.Authorization = `Bearer ${apiKey}`;
  }

  const response = await fetch(endpoint, {
    method: 'POST',
    headers,
    body: JSON.stringify({
      model,
      messages,
      temperature,
    }),
  });

  if (!response.ok) {
    const errorText = await response.text();
    console.warn(`${provider} request failed (${response.status}): ${errorText}`);
    return null;
  }

  const data = await response.json();
  const content = data.choices?.[0]?.message?.content;
  if (typeof content === 'string' && content.trim()) {
    return content.trim();
  }

  return null;
}

/**
 * Calls the configured provider pool using DeepSeek and GLM APIs.
 */
export async function callOpenRouter(
  messages: Message[],
  preferredKeyIndex?: number,
  temperature = 0.7
): Promise<string> {
  const apiKeys = getApiKeyPool();

  if (apiKeys.length === 0) {
    throw new Error('No provider API keys were configured.');
  }

  const orderedKeys = [...apiKeys];
  if (preferredKeyIndex && preferredKeyIndex >= 1 && preferredKeyIndex <= 4) {
    const preferred = apiKeys[preferredKeyIndex - 1];
    if (preferred) {
      orderedKeys.splice(orderedKeys.indexOf(preferred), 1);
      orderedKeys.unshift(preferred);
    }
  }

  const providers = [
    { provider: 'deepseek' as const, endpoint: 'https://api.deepseek.com/chat/completions', model: 'deepseek-chat' },
    { provider: 'glm' as const, endpoint: 'https://open.bigmodel.cn/api/paas/v4/chat/completions', model: 'glm-4-flash' },
  ];

  let lastError: unknown = null;

  for (const providerConfig of providers) {
    for (const apiKey of orderedKeys) {
      try {
        const result = await tryProviderCall(
          providerConfig.endpoint,
          providerConfig.model,
          apiKey,
          messages,
          temperature,
          providerConfig.provider
        );

        if (result) {
          return result;
        }
      } catch (err) {
        lastError = err;
        console.warn(`${providerConfig.provider} fetch error:`, err);
      }
    }
  }

  if (lastError) {
    console.warn('Provider fallback exhausted, returning a local response.');
  }

  return 'This is a locally generated fallback response because the configured provider endpoints were not available at the moment.';
}

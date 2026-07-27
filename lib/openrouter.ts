export interface Message {
  role: 'system' | 'user' | 'assistant';
  content: string;
}

interface ProviderConfig {
  provider: 'deepseek' | 'glm' | 'groq' | 'gemini';
  endpoint: string;
  model: string;
  apiKey: string;
}

function getProviderPool(): ProviderConfig[] {
  const providers: ProviderConfig[] = [];

  const deepseek1 = process.env.DEEPSEEK_API_KEY_1;
  const deepseek2 = process.env.DEEPSEEK_API_KEY_2;
  const glmKey = process.env.GLM_API_KEY;
  const groqKey = process.env.GROQ_API_KEY;
  const geminiKey = process.env.GEMINI_API_KEY;

  if (deepseek1) {
    providers.push({ provider: 'deepseek', endpoint: 'https://mars-123-resource.services.ai.azure.com/openai/v1/chat/completions', model: 'deepseek-chat', apiKey: deepseek1 });
  }

  if (deepseek2) {
    providers.push({ provider: 'deepseek', endpoint: 'https://mars-123-resource.services.ai.azure.com/openai/v1/chat/completions', model: 'deepseek-chat', apiKey: deepseek2 });
  }

  if (glmKey) {
    providers.push({ provider: 'glm', endpoint: 'https://open.bigmodel.cn/api/paas/v4/chat/completions', model: 'glm-4-flash', apiKey: glmKey });
  }

  if (groqKey) {
    providers.push({ provider: 'groq', endpoint: 'https://mars-123-resource.services.ai.azure.com/openai/v1/chat/completions', model: 'llama-3.1-8b-instant', apiKey: groqKey });
  }

  if (geminiKey) {
    providers.push({ provider: 'gemini', endpoint: `https://generativelanguage.googleapis.com/v1beta/models/gemini-2.0-flash:generateContent?key=${geminiKey}`, model: 'gemini-2.0-flash', apiKey: geminiKey });
  }

  return providers;
}

async function tryProviderCall(
  providerConfig: ProviderConfig,
  messages: Message[],
  temperature: number
): Promise<string | null> {
  const headers: Record<string, string> = {
    'Content-Type': 'application/json',
  };

  let body: string;

  if (providerConfig.provider === 'gemini') {
    const prompt = messages.map((message) => `${message.role.toUpperCase()}: ${message.content}`).join('\n\n');
    body = JSON.stringify({
      contents: [{ parts: [{ text: prompt }] }],
      generationConfig: { temperature },
    });
  } else {
    headers.Authorization = `Bearer ${providerConfig.apiKey}`;
    body = JSON.stringify({
      model: providerConfig.model,
      messages,
      temperature,
      max_completion_tokens: 1024,
      top_p: 1,
    });
  }

  const response = await fetch(providerConfig.endpoint, {
    method: 'POST',
    headers,
    body,
  });

  if (!response.ok) {
    const errorText = await response.text();
    console.warn(`${providerConfig.provider} request failed (${response.status}): ${errorText}`);
    return null;
  }

  const data = await response.json();

  if (providerConfig.provider === 'gemini') {
    const text = data.candidates?.[0]?.content?.parts?.[0]?.text;
    if (typeof text === 'string' && text.trim()) {
      return text.trim();
    }

    return null;
  }

  const content = data.choices?.[0]?.message?.content;
  if (typeof content === 'string' && content.trim()) {
    return content.trim();
  }

  return null;
}

/**
 * Calls the configured provider pool using DeepSeek, GLM, Groq, and Gemini APIs.
 */
export async function callOpenRouter(
  messages: Message[],
  preferredKeyIndex?: number,
  temperature = 0.7
): Promise<string> {
  const providerPool = getProviderPool();

  if (providerPool.length === 0) {
    throw new Error('No provider API keys were configured.');
  }

  const orderedProviders = [...providerPool];
  if (preferredKeyIndex && preferredKeyIndex >= 1 && preferredKeyIndex <= orderedProviders.length) {
    const preferred = orderedProviders[preferredKeyIndex - 1];
    if (preferred) {
      orderedProviders.splice(orderedProviders.indexOf(preferred), 1);
      orderedProviders.unshift(preferred);
    }
  }

  let lastError: unknown = null;

  for (const providerConfig of orderedProviders) {
    try {
      const result = await tryProviderCall(providerConfig, messages, temperature);
      if (result) {
        return result;
      }
    } catch (err) {
      lastError = err;
      console.warn(`${providerConfig.provider} fetch error:`, err);
    }
  }

  if (lastError) {
    console.warn('Provider fallback exhausted, returning a local response.');
  }

  return 'This is a locally generated fallback response because the configured provider endpoints were not available at the moment.';
}

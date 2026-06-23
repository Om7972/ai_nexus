// Cost calculation definitions for various LLM and generation models
const MODEL_PRICES = {
  // Prices per 1,000 tokens
  'gemini-1.5-pro': { prompt: 0.007, completion: 0.021 },
  'gemini-1.5-flash': { prompt: 0.000075, completion: 0.0003 },
  'gpt-4o': { prompt: 0.005, completion: 0.015 },
  'claude-3-5-sonnet': { prompt: 0.003, completion: 0.015 },
  'gpt-3.5-turbo': { prompt: 0.0005, completion: 0.0015 },
  'dall-e-3': { flat: 0.040 }, // Flat rate per generation
  'dall-e-2': { flat: 0.020 },
  'stable-diffusion': { flat: 0.010 }
};

export const calculateCost = (model, promptTokens = 0, completionTokens = 0) => {
  const normalizedModel = Object.keys(MODEL_PRICES).find(
    (key) => model.toLowerCase().includes(key)
  );

  const pricing = MODEL_PRICES[normalizedModel || 'gemini-1.5-flash'] || MODEL_PRICES['gemini-1.5-flash'];

  if (pricing.flat) {
    return pricing.flat;
  }

  const promptCost = (promptTokens / 1000) * pricing.prompt;
  const completionCost = (completionTokens / 1000) * pricing.completion;

  return Number((promptCost + completionCost).toFixed(6));
};

export const getCheaperModelRecommendation = (currentModel) => {
  const modelLower = currentModel.toLowerCase();
  if (modelLower.includes('gemini-1.5-pro') || modelLower.includes('gpt-4') || modelLower.includes('opus')) {
    return {
      alternative: 'gemini-1.5-flash',
      savingsPercent: 95,
      reason: 'Gemini 1.5 Flash provides fast reasoning at 1/100th the price of high-tier models. Highly recommended for non-complex summarization, text edits, or OCR processing.'
    };
  }
  if (modelLower.includes('dall-e-3')) {
    return {
      alternative: 'stable-diffusion',
      savingsPercent: 75,
      reason: 'Stable Diffusion runs on local/hosted servers at a fraction of DALL-E 3 prices. Use for draft generation.'
    };
  }
  return null;
};

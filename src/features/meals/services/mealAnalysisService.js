// src/features/meals/services/mealAnalysisService.js
/**
 * Meal Analysis Service - Handles Claude AI integration for food image analysis
 */

const analyseWithClaude = async (base64Image, mimeType = 'image/jpeg') => {
  const apiKey = process.env.EXPO_PUBLIC_CLAUDE_API_KEY;
  if (!apiKey) {
    throw new Error('Claude API key not configured. Please set EXPO_PUBLIC_CLAUDE_API_KEY');
  }
  
  const controller = new AbortController();
  const timeoutId = setTimeout(() => controller.abort(), 30000); // 30 second timeout
  
  try {
    const response = await fetch('https://api.anthropic.com/v1/messages', {
      method: 'POST',
      headers: { 
        'Content-Type': 'application/json',
        'x-api-key': apiKey,
        'anthropic-version': '2023-06-01'
      },
      signal: controller.signal,
      body: JSON.stringify({
        model: 'claude-sonnet-4-20250514',
        max_tokens: 1000,
        messages: [
        {
          role: 'user',
          content: [
            {
              type: 'image',
              source: { type: 'base64', media_type: mimeType, data: base64Image },
            },
            {
              type: 'text',
              text: `You are a nutrition expert AI for a diabetes reversal app called Reversia. 
Analyse this food image and return ONLY a JSON object — no extra text, no markdown fences.

JSON format:
{
  "foodName": "Name of the food or dish",
  "servingSize": "estimated serving size (e.g. 1 bowl, 200g)",
  "calories": 0,
  "protein": 0,
  "carbs": 0,
  "fats": 0,
  "fiber": 0,
  "sugar": 0,
  "glycemicIndex": "Low | Medium | High",
  "diabetesSafe": true or false,
  "insulinImpact": "Low | Moderate | High",
  "healthScore": 0,
  "tip": "One short diabetes-specific tip about this food (max 20 words)"
}

All numeric values are numbers, not strings. healthScore is 0-100.`,
            },
          ],
        },
      ],
    }),
  });
    
    if (!response.ok) {
      const error = await response.json();
      throw new Error(error.error?.message || `API error: ${response.status}`);
    }
    
    const data = await response.json();
    const raw = data.content?.[0]?.text || '';
    // Strip any accidental markdown fences
    const clean = raw.replace(/```json|```/g, '').trim();
    return JSON.parse(clean);
  } catch (error) {
    if (error.name === 'AbortError') {
      throw new Error('Image analysis timed out. Please try again.');
    }
    throw error;
  } finally {
    clearTimeout(timeoutId);
  }
};

export { analyseWithClaude };

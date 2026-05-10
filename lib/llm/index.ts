import Anthropic from '@anthropic-ai/sdk';
import { MealCandidate } from '@/types/meal';

const client = new Anthropic({ apiKey: process.env.ANTHROPIC_API_KEY });

export async function generateMealSuggestions(
  prompt: string
): Promise<MealCandidate[]> {
  const message = await client.messages.create({
    model: 'claude-haiku-4-5-20251001',
    max_tokens: 2048,
    messages: [{ role: 'user', content: prompt }],
  });

  const text =
    message.content[0].type === 'text' ? message.content[0].text : '';
  const jsonMatch = text.match(/\{[\s\S]*\}/);
  if (!jsonMatch) throw new Error('No JSON in LLM response');

  const parsed = JSON.parse(jsonMatch[0]);
  return parsed.candidates as MealCandidate[];
}

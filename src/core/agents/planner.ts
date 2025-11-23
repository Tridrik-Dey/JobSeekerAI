import { z } from 'zod';
import { ChatOpenAI } from '@langchain/openai';

export const PlanSchema = z.object({
    steps: z.array(z.string()).describe('List of steps to achieve the goal'),
    reasoning: z.string().describe('Reasoning behind the plan'),
});

export type Plan = z.infer<typeof PlanSchema>;

export class PlannerAgent {
    private model: ChatOpenAI | null;

    constructor() {
        const provider = process.env.AI_PROVIDER || 'openai';

        if (provider === 'mock') {
            this.model = null;
        } else if (provider === 'nvidia') {
            this.model = new ChatOpenAI({
                modelName: 'meta/llama-3.1-70b-instruct',
                temperature: 0,
                openAIApiKey: process.env.NVIDIA_API_KEY,
                configuration: {
                    baseURL: 'https://integrate.api.nvidia.com/v1',
                }
            });
        } else {
            // Check if using OpenRouter API key
            const apiKey = process.env.OPENAI_API_KEY || '';
            const isOpenRouter = apiKey.startsWith('sk-or-');

            this.model = new ChatOpenAI({
                modelName: isOpenRouter ? 'openai/gpt-4o' : 'gpt-4o',
                temperature: 0,
                maxTokens: 2000, // Limit tokens to stay within credit limits
                openAIApiKey: apiKey,
                configuration: isOpenRouter ? {
                    baseURL: 'https://openrouter.ai/api/v1',
                } : undefined,
            });
        }
    }

    async plan(goal: string): Promise<Plan> {
        console.log(`Planning for goal: ${goal}`);

        if (process.env.AI_PROVIDER === 'mock') {
            return {
                steps: [
                    'Navigate to https://example.com',
                    'Screenshot example_page'
                ],
                reasoning: 'Simple navigation and screenshot task'
            };
        }

        if (!this.model) {
            throw new Error('Model not initialized');
        }

        const structuredModel = this.model.withStructuredOutput(PlanSchema);

        const prompt = `You are an expert web automation agent.
        Your goal is: ${goal}
        
        Create a step-by-step plan to achieve this goal using a web browser.
        The steps should be high-level actions like "Navigate to...", "Search for...", "Click on...", "Extract...".
        Keep the plan concise and focused.`;

        const result = await structuredModel.invoke(prompt);
        return result;
    }
}

'use server';

/**
 * @fileOverview Summarizes a collection of inspirational messages to identify common themes.
 *
 * - summarizeInspirationalMessages - A function that handles the summarization process.
 * - SummarizeInspirationalMessagesInput - The input type for the summarizeInspirationalMessages function.
 * - SummarizeInspirationalMessagesOutput - The return type for the summarizeInspirationalMessages function.
 */

import {ai} from '@/ai/genkit';
import {z} from 'genkit';

const SummarizeInspirationalMessagesInputSchema = z.object({
  messages: z
    .array(z.string())
    .describe('An array of inspirational messages to summarize.'),
});
export type SummarizeInspirationalMessagesInput = z.infer<
  typeof SummarizeInspirationalMessagesInputSchema
>;

const SummarizeInspirationalMessagesOutputSchema = z.object({
  summary: z.string().describe('A summary of the common themes in the messages.'),
});
export type SummarizeInspirationalMessagesOutput = z.infer<
  typeof SummarizeInspirationalMessagesOutputSchema
>;

export async function summarizeInspirationalMessages(
  input: SummarizeInspirationalMessagesInput
): Promise<SummarizeInspirationalMessagesOutput> {
  return summarizeInspirationalMessagesFlow(input);
}

const prompt = ai.definePrompt({
  name: 'summarizeInspirationalMessagesPrompt',
  input: {schema: SummarizeInspirationalMessagesInputSchema},
  output: {schema: SummarizeInspirationalMessagesOutputSchema},
  prompt: `You are an AI assistant helping a group admin summarize inspirational messages. The group admin wants to identify common themes to select content for a 'Friendship Chronicle' anthology.

Here are the messages:

{{#each messages}}
- {{{this}}}
{{/each}}

Summarize the common themes in the messages.`,
});

const summarizeInspirationalMessagesFlow = ai.defineFlow(
  {
    name: 'summarizeInspirationalMessagesFlow',
    inputSchema: SummarizeInspirationalMessagesInputSchema,
    outputSchema: SummarizeInspirationalMessagesOutputSchema,
  },
  async input => {
    const {output} = await prompt(input);
    return output!;
  }
);

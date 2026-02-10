'use server';

/**
 * @fileOverview 영감을 주는 메시지 모음에서 공통 주제를 파악하여 요약합니다.
 *
 * - summarizeInspirationalMessages - 요약 프로세스를 처리하는 함수입니다.
 * - SummarizeInspirationalMessagesInput - summarizeInspirationalMessages 함수의 입력 타입입니다.
 * - SummarizeInspirationalMessagesOutput - summarizeInspirationalMessages 함수의 반환 타입입니다.
 */

import {ai} from '@/ai/genkit';
import {z} from 'genkit';

const SummarizeInspirationalMessagesInputSchema = z.object({
  messages: z
    .array(z.string())
    .describe('요약할 영감있는 메시지 배열입니다.'),
});
export type SummarizeInspirationalMessagesInput = z.infer<
  typeof SummarizeInspirationalMessagesInputSchema
>;

const SummarizeInspirationalMessagesOutputSchema = z.object({
  summary: z.string().describe('메시지에 나타난 공통 주제에 대한 요약입니다.'),
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
  prompt: `당신은 모임 관리자가 영감을 주는 메시지를 요약하는 것을 돕는 AI 비서입니다. 모임 관리자는 '우정 연대기' 앤솔로지에 들어갈 콘텐츠를 선택하기 위해 공통된 주제를 파악하고 싶어합니다.

다음은 메시지들입니다:

{{#each messages}}
- {{{this}}}
{{/each}}

메시지들의 공통된 주제를 요약해주세요.`,
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

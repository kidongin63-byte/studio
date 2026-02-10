'use client';

import { useMemo } from 'react';
import { useFormState, useFormStatus } from 'react-dom';
import Link from 'next/link';
import { collection, query, orderBy } from 'firebase/firestore';

import { summarizeInspirationalMessages } from '@/ai/flows/summarize-inspirational-messages';
import { useFirestore, useCollection } from '@/firebase';
import type { Message } from '@/lib/data';

import { Button } from '@/components/ui/button';
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from '@/components/ui/card';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Sparkles, Loader2, Lightbulb, MessageSquare } from 'lucide-react';

type SummaryState = {
  summary: string;
  error?: string | null;
};

async function runSummary(
  prevState: SummaryState,
  formData: FormData
): Promise<SummaryState> {
  const messagesStr = formData.get('messages') as string;
  if (!messagesStr) {
    return { summary: '', error: '요약할 메시지가 없습니다.' };
  }
  const messages = messagesStr.split('\n\n').filter((m) => m.trim() !== '');

  try {
    const result = await summarizeInspirationalMessages({ messages });
    return { summary: result.summary };
  } catch (e) {
    console.error(e);
    return {
      summary: '',
      error: '요약을 생성하지 못했습니다. 다시 시도해 주세요.',
    };
  }
}

function SubmitButton({ disabled }: { disabled?: boolean }) {
  const { pending } = useFormStatus();
  return (
    <Button type="submit" disabled={pending || disabled}>
      {pending ? (
        <>
          <Loader2 className="mr-2 h-4 w-4 animate-spin" />
          요약 중...
        </>
      ) : (
        <>
          <Sparkles className="mr-2 h-4 w-4" />
          요약 생성
        </>
      )}
    </Button>
  );
}

export default function AiSummaryPage() {
  const [state, formAction] = useFormState(runSummary, { summary: '' });

  const firestore = useFirestore();
  const messagesQuery = useMemo(() => {
    if (!firestore) return null;
    return query(collection(firestore, 'messages'), orderBy('createdAt', 'desc'));
  }, [firestore]);

  const { data: messages, loading: messagesLoading } = useCollection<Message & { createdAt: any }>(messagesQuery);

  return (
    <div className="max-w-4xl mx-auto space-y-6">
      <div>
        <h1 className="text-3xl font-bold font-headline">AI 콘텐츠 요약</h1>
        <p className="text-muted-foreground">
          AI를 사용하여 영감을 주는 메시지의 공통 주제를 찾아 앤솔로지를
          만들어보세요.
        </p>
      </div>

      <form action={formAction}>
        {/* Pass messages to server action via hidden input */}
        <input
          type="hidden"
          name="messages"
          value={messages?.map((m) => m.content).join('\n\n') || ''}
        />
        <Card>
          <CardHeader>
            <CardTitle>요약할 메시지</CardTitle>
            <CardDescription>
              아래는 데이터베이스에서 가져온 모든 영감을 주는 메시지들입니다.
            </CardDescription>
          </CardHeader>
          <CardContent>
            <ScrollArea className="h-72 w-full rounded-md border p-4">
              {messagesLoading ? (
                <div className="flex items-center justify-center h-full">
                  <Loader2 className="h-8 w-8 animate-spin" />
                </div>
              ) : messages && messages.length > 0 ? (
                <div className="space-y-4">
                  {messages.map((message) => (
                    <div key={message.id} className="text-sm">
                      <p className="font-medium">{message.content}</p>
                      <p className="text-xs text-muted-foreground">- {message.author}</p>
                    </div>
                  ))}
                </div>
              ) : (
                <div className="flex flex-col items-center justify-center h-full text-muted-foreground text-center">
                  <MessageSquare className="h-8 w-8 mb-2" />
                  <p className="font-semibold">요약할 메시지가 없습니다.</p>
                  <p className="text-sm">먼저 영감을 주는 메시지를 작성해주세요.</p>
                  <Button asChild variant="secondary" className="mt-4">
                      <Link href="/dashboard/messages/new">새 메시지 작성하기</Link>
                  </Button>
                </div>
              )}
            </ScrollArea>
          </CardContent>
          <CardFooter className="flex justify-end">
            <SubmitButton disabled={messagesLoading || !messages || messages.length === 0} />
          </CardFooter>
        </Card>
      </form>

      {state.error && (
        <Card className="bg-destructive/10 border-destructive">
          <CardHeader>
            <CardTitle className="text-destructive">오류가 발생했습니다</CardTitle>
          </CardHeader>
          <CardContent>
            <p>{state.error}</p>
          </CardContent>
        </Card>
      )}

      {state.summary && (
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Lightbulb className="text-primary" />
              주제 요약
            </CardTitle>
            <CardDescription>
              AI가 찾은 공통 주제는 다음과 같습니다.
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="prose prose-lg dark:prose-invert max-w-none">
              <p className="whitespace-pre-wrap">{state.summary}</p>
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  );
}

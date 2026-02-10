"use client";

import { useFormState, useFormStatus } from "react-dom";
import { summarizeInspirationalMessages } from "@/ai/flows/summarize-inspirational-messages";
import { messages } from "@/lib/data";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Sparkles, Loader2, Lightbulb } from "lucide-react";

const initialMessages = messages.map((msg) => msg.content).join("\n\n");

type SummaryState = {
  summary: string;
  error?: string | null;
};

async function runSummary(
  prevState: SummaryState,
  formData: FormData
): Promise<SummaryState> {
  const messagesStr = formData.get("messages") as string;
  if (!messagesStr) {
    return { summary: "", error: "요약할 메시지가 없습니다." };
  }
  const messages = messagesStr.split("\n\n").filter(m => m.trim() !== '');

  try {
    const result = await summarizeInspirationalMessages({ messages });
    return { summary: result.summary };
  } catch (e) {
    console.error(e);
    return { summary: "", error: "요약을 생성하지 못했습니다. 다시 시도해 주세요." };
  }
}

function SubmitButton() {
  const { pending } = useFormStatus();
  return (
    <Button type="submit" disabled={pending}>
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
  const [state, formAction] = useFormState(runSummary, { summary: "" });

  return (
    <div className="max-w-4xl mx-auto space-y-6">
      <div>
        <h1 className="text-3xl font-bold font-headline">AI 콘텐츠 요약</h1>
        <p className="text-muted-foreground">
          AI를 사용하여 영감을 주는 메시지의 공통 주제를 찾아 앤솔로지를 만들어보세요.
        </p>
      </div>

      <form action={formAction}>
        <Card>
          <CardHeader>
            <CardTitle>요약할 메시지</CardTitle>
            <CardDescription>
              회원들의 영감을 주는 메시지가 아래에 미리 로드되어 있습니다. 요약을 생성하기 전에 편집할 수 있습니다.
            </CardDescription>
          </CardHeader>
          <CardContent>
            <Textarea
              name="messages"
              defaultValue={initialMessages}
              rows={15}
              className="font-body"
              placeholder="여기에 메시지를 입력하세요. 메시지들은 빈 줄로 구분됩니다..."
            />
          </CardContent>
          <CardFooter className="flex justify-end">
            <SubmitButton />
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
              <Lightbulb className="text-primary"/>
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

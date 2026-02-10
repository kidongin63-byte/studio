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
    return { summary: "", error: "No messages to summarize." };
  }
  const messages = messagesStr.split("\n\n").filter(m => m.trim() !== '');

  try {
    const result = await summarizeInspirationalMessages({ messages });
    return { summary: result.summary };
  } catch (e) {
    console.error(e);
    return { summary: "", error: "Failed to generate summary. Please try again." };
  }
}

function SubmitButton() {
  const { pending } = useFormStatus();
  return (
    <Button type="submit" disabled={pending}>
      {pending ? (
        <>
          <Loader2 className="mr-2 h-4 w-4 animate-spin" />
          Summarizing...
        </>
      ) : (
        <>
          <Sparkles className="mr-2 h-4 w-4" />
          Generate Summary
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
        <h1 className="text-3xl font-bold font-headline">AI Content Summarization</h1>
        <p className="text-muted-foreground">
          Use AI to find common themes in our inspirational messages for the anthology.
        </p>
      </div>

      <form action={formAction}>
        <Card>
          <CardHeader>
            <CardTitle>Messages to Summarize</CardTitle>
            <CardDescription>
              The inspirational messages from our members are pre-loaded below. You can edit them before generating the summary.
            </CardDescription>
          </CardHeader>
          <CardContent>
            <Textarea
              name="messages"
              defaultValue={initialMessages}
              rows={15}
              className="font-body"
              placeholder="Enter messages here, separated by double newlines..."
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
            <CardTitle className="text-destructive">An Error Occurred</CardTitle>
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
              Summary of Themes
            </CardTitle>
            <CardDescription>
              Here are the common themes found by the AI.
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

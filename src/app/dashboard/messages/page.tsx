import { messages } from "@/lib/data";
import {
  Card,
  CardContent,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Quote } from "lucide-react";

export default function MessagesPage() {
  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold font-headline">영감을 주는 메시지</h1>
        <p className="text-muted-foreground">
          회원들의 지혜와 따뜻한 말 한마디를 모았습니다.
        </p>
      </div>

      <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
        {messages.map((message) => (
          <Card key={message.id} className="flex flex-col">
            <CardHeader>
              <Quote className="h-8 w-8 text-primary/30" />
            </CardHeader>
            <CardContent className="flex-grow">
              <blockquote className="text-lg font-medium leading-relaxed">
                {message.content}
              </blockquote>
            </CardContent>
            <CardFooter>
              <p className="text-sm font-semibold text-muted-foreground">
                - {message.author}
              </p>
            </CardFooter>
          </Card>
        ))}
      </div>
    </div>
  );
}

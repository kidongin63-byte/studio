import { rules } from "@/lib/data";
import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from "@/components/ui/accordion";

export default function RulesPage() {
  return (
    <div className="max-w-3xl mx-auto space-y-6">
      <div>
        <h1 className="text-3xl font-bold text-center font-headline">우리들의 약속 (회칙)</h1>
        <p className="text-muted-foreground text-center mt-2">
          언제 어디서나 확인할 수 있는 우리 그룹의 원칙입니다.
        </p>
      </div>

      <Accordion type="single" collapsible className="w-full">
        {rules.map((rule) => (
          <AccordionItem value={rule.id} key={rule.id}>
            <AccordionTrigger className="text-lg font-semibold font-headline">
              {rule.title}
            </AccordionTrigger>
            <AccordionContent className="text-base text-foreground/80 leading-relaxed">
              {rule.content}
            </AccordionContent>
          </AccordionItem>
        ))}
      </Accordion>
    </div>
  );
}

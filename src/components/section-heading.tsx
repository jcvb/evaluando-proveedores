import type { LucideIcon } from "lucide-react";

export function SectionHeading({
  icon: Icon,
  step,
  title,
  description,
}: {
  icon: LucideIcon;
  step?: string;
  title: string;
  description?: string;
}) {
  return (
    <div className="flex items-start gap-3">
      <span className="mt-0.5 flex size-10 shrink-0 items-center justify-center rounded-full bg-primary/10 text-primary">
        <Icon className="size-5" aria-hidden />
      </span>
      <div>
        {step ? <p className="text-sm font-semibold text-primary">{step}</p> : null}
        <h2 className="font-heading text-xl">{title}</h2>
        {description ? <p className="mt-0.5 text-[0.95rem] text-muted-foreground">{description}</p> : null}
      </div>
    </div>
  );
}

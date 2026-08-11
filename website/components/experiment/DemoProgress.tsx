"use client";

const STEPS = [
  ["01", "Question"],
  ["02", "Primary"],
  ["03", "Diagnosis"],
  ["04", "Replication"],
  ["05", "Verdict"],
  ["06", "Limits"],
] as const;

export default function DemoProgress({ activeStep }: { activeStep: number }) {
  return (
    <nav aria-label="Experiment progress" className="surface-card sticky top-[65px] z-20 rounded-box border-base-300/80 px-3 py-2">
      <div className="flex items-center justify-between gap-1 overflow-x-auto">
        {STEPS.map(([number, label], index) => {
          const complete = index < activeStep;
          const active = index === activeStep;
          return (
            <a
              key={number}
              href={`#demo-step-${index + 1}`}
              className={`flex shrink-0 items-center gap-2 rounded-btn px-2 py-1.5 font-mono text-2xs uppercase tracking-[0.12em] transition-colors ${
                active ? "bg-primary/10 text-primary" : complete ? "text-success" : "text-base-content/35"
              }`}
            >
              <span className="font-semibold">{number}</span>
              <span>{label}</span>
            </a>
          );
        })}
      </div>
    </nav>
  );
}

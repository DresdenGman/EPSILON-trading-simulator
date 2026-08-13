"use client";

const STEPS = [
  ["01", "Question"],
  ["02", "Primary"],
  ["03", "Diagnosis"],
  ["04", "Conclusion"],
  ["05", "Replication"],
  ["06", "Limits"],
] as const;

export default function DemoProgress({ activeStep }: { activeStep: number }) {
  return (
    <nav aria-label="Experiment progress" className="sticky top-16 z-20 border-y border-base-300/70 bg-[#071323]/95 backdrop-blur-xl">
      <div className="flex items-center overflow-x-auto">
        {STEPS.map(([number, label], index) => {
          const complete = index < activeStep;
          const active = index === activeStep;
          return (
            <a
              key={number}
              href={`#demo-step-${index + 1}`}
              className={`flex min-h-12 flex-1 shrink-0 items-center justify-center gap-2 border-b-2 px-4 py-3 font-mono text-2xs uppercase tracking-[0.12em] transition-colors ${
                active ? "border-primary bg-primary/5 text-primary" : complete ? "border-transparent text-base-content/55" : "border-transparent text-base-content/35 hover:text-base-content/60"
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

export const repository = "https://github.com/DresdenGman/EPSILON-trading-simulator";
export const discussion = `${repository}/discussions/8`;

// Recorded milestones, not undocumented inception dates.
export const milestones = [
  { date: "December 9, 2025", title: "The trading simulator", kind: "Source history", description: "The first repository records contain a Python desktop simulator, equity curves, performance metrics, and order handling. The project begins with making market behavior observable.", href: `${repository}/commit/fc81b85` },
  { date: "January–February 2026", title: "EPSILON takes shape", kind: "Source history", description: "The EPSILON name, a public web presentation, and reorganized analysis and strategy modules appear in the repository. Earlier implementations remain available as development history.", href: `${repository}/commit/9e06432` },
  { date: "March 2026", title: "Diamond Challenge · Beijing", kind: "Recognition", description: "Third Prize at the 2026 Beijing Pitch Event. The event was scheduled for March 7; the organizing committee sent the award certificate to Team EPSILON on March 13. This is a regional award, not a global placement.", href: "/evidence/diamond-challenge-2026-beijing-third-prize.jpg" },
  { date: "June 14, 2026", title: "A full-stack implementation", kind: "Source history", description: "A FastAPI/PostgreSQL and Next.js implementation expands the project beyond the desktop. It is preserved in this repository, separate from today's public instrument.", href: `${repository}/commit/9579fc9` },
  { date: "August 10–13, 2026", title: "From simulation to explicit claims", kind: "Source history", description: "The quantitative decision lab introduces a workflow around hypotheses, experiments, and evidence. Public documentation, demonstration media, and an impact ledger follow.", href: `${repository}/commit/0560eac` },
  { date: "August 30–September 2, 2026", title: "The current evidence instrument", kind: "Source history", description: "A baseline and five perturbations, exportable evidence, and a server-side historical-data path. Demonstration arithmetic and historical market data are kept distinct.", href: `${repository}/pull/15` },
  { date: "September 7–13, 2026", title: "Review, reproducibility, and access", kind: "Source history", description: "Merged contributions improve checks and reporting. Fixed case 001, build identity, reproduction instructions, and English-language cleanup make the work easier to inspect. The first maintainer case is rejected; the negative result stays visible.", href: `${repository}/pull/24` },
] as const;

export const participationPaths = [
  { title: "Bring a question", description: "Describe a backtest conclusion you do not fully trust. A question and public chart are enough to start; no code contribution is required.", label: "Join the discussion", href: discussion },
  { title: "Try the fixed case", description: "Follow case 001 and report agreement, a mismatch, or a blocked attempt. Separate hosted use from independent recomputation.", label: "Read the reproduction guide", href: `${repository}/blob/main/docs/REFERENCE_CASE.md` },
  { title: "Host an assumption clinic", description: "Use a short worksheet with a small group. Question the inference and adapt the checklist. This format is a pilot, not a proven educational intervention.", label: "Use the session kit", href: `${repository}/blob/main/docs/community/ASSUMPTION_CLINIC.md` },
] as const;

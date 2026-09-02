# EPSILON public launch kit

This is the source of truth for communicating EPSILON publicly. It exists to make the project easier to discover without turning a research product into an overclaim.

For audience-specific bilingual copy, personal-narrative framing, outreach messages, response templates, and the seven-day distribution sequence, use the [EPSILON Communication Pack](COMMUNICATION_PACK.md).

## The one-sentence position

**EPSILON is a quantitative decision lab that turns a market idea into a falsifiable research loop: observe, test, challenge, and retest.**

## The problem it names

Most backtesting tools give a performance output. They make it easy to forget the assumptions, missing provenance, execution model, and rejection rule that determine what the output actually means.

EPSILON keeps those boundaries attached to the work. A changed question makes prior evidence stale; a failed retest remains visible; unknown data stays unknown.

## Demonstrated product facts

Only use these statements without additional qualification:

- The public product has one research path: **Define → Perturb → Challenge → Revise**.
- A user records a claim and machine-readable rejection rule before computation.
- One baseline, four atomic perturbations, and one joint stress remain visible together.
- Every completed run can be exported as a JSON evidence artifact with configuration, provenance, exact outcomes, limitations, and SHA-256 fingerprints.
- Historical evaluation uses adjusted daily bars from the server-side Massive adapter; deterministic demonstration remains a separate, labeled mode.
- The public instrument requires no login.
- Public measurement separates anonymous browser signals from server-verified historical experiments and stores no account identifiers.
- EPSILON is open source and its original desktop history remains in this repository.

## Claims that require evidence first

Do not use these until real user evidence exists:

- “Improves investment performance” or “finds alpha”
- “AI-powered investment advice”
- “Real-time market data,” “institutional-grade data,” or unrestricted market-data coverage
- Any user, traffic, accuracy, profitability, or adoption number
- Any statement implying one historical result establishes statistical significance, profitability, or general robustness

## Links

- Product: `https://epsilonfield.space`
- Working product: `https://epsilonfield.space/lab`
- Repository: `https://github.com/DresdenGman/EPSILON-trading-simulator`
- Social preview asset: `website/public/social/epsilon-social-preview-v1.jpg`
- 30-second product video: `docs/media/epsilon-demo-30s/epsilon-decision-lab-30s.mp4`
- Video poster: `docs/media/epsilon-demo-30s/epsilon-decision-lab-30s-poster.jpg`

Before publishing, upload the preview asset through **Repository Settings → Social preview**. It is 1280 × 640 px and under 1 MB.

## First seven days

### Day 0 — make the links legible

1. Upload the GitHub social preview image.
2. Pin this repository on the author profile.
3. Confirm the root, laboratory, impact, and disclosure links open in an incognito browser.
4. Preserve the source-backed baseline in `docs/metrics/` before distribution.

### Days 1–3 — earn feedback before announcing a launch

Share one short build note with people who can give concrete feedback: quantitative-research learners, technical founders, open-source maintainers, and people who have actually used backtests.

Ask one question only:

> Which assumption is still too easy for the instrument to hide?

Do not ask for stars, upvotes, or shares. Ask for a five-minute use and an honest reply.

### Days 4–5 — publish the technical story

Publish a concise post explaining the narrow problem:

> A backtest can produce a number while hiding the conditions under which that number stops meaning what you think it means.

Link to the live instrument and repository. Include one short screen recording from pre-specified rejection rule to exported evidence artifact.

### Days 6–7 — select the launch channel

Use feedback to decide whether the next step is a community post, a Show HN submission, or more product iteration.

- **Show HN:** appropriate when the story is technical and specific. The title must begin with `Show HN:`.
- **Product Hunt:** reserve for a significant, stable release and use a real personal maker account. Do not solicit upvotes; invite people to try the product and comment.
- **Professional / founder network:** use for the product narrative and lessons learned, not a generic “launch announcement.”

## Draft copy

### Short social post

> I built EPSILON because a backtest can look convincing long after its assumptions have stopped being visible.
>
> It turns a market idea into a simple loop: observe → test → challenge → retest. Change the question, and the old evidence becomes stale instead of disappearing.
>
> It is an open-source quantitative decision lab, not an investing-advice tool. I would value feedback on where this workflow is still too easy to misread.
>
> [product link] · [repository link]

### Show HN draft

**Title:** `Show HN: EPSILON – an open-source decision lab for falsifiable market research`

> Hi HN — I originally built EPSILON as a trading simulator. I rebuilt the web product around a narrower problem: backtests often show a result without making it clear which assumptions, missing data, and rejection conditions still bound that result.
>
> EPSILON has one workflow: write a claim and falsification condition, choose historical symbols and a window, run one baseline plus five nearby perturbations, inspect the exact configuration and provenance, then challenge the interpretation.
>
> Historical mode uses adjusted daily bars from Massive. The artifact records a source-data fingerprint and checksum, but it does not model intraday liquidity, market impact, taxes, borrow constraints, or partial fills. It makes no claim of profitability or investment advice.
>
> I would especially value feedback from people who build or use backtesting tools: where does this evidence workflow still fail to make the limits of a result clear?
>
> Live product: [product link]
> Source: [repository link]

### Product Hunt maker comment

> I built EPSILON after noticing how quickly a clean performance number can detach from the assumptions that produced it. The goal here is not to make market claims louder; it is to make the question, evidence boundary, and failure condition harder to lose.
>
> I would love to hear which part of the loop you would want to use—or challenge—first.

## Launch acceptance gate

Do not submit a major public launch until all are true:

- The public homepage has one primary call to action: open the workspace.
- The public laboratory can be used and its evidence exported without an account.
- The latest production deployment has passed the test suite and production build.
- The launch post links to a real working product, not a prototype route.
- A new visitor can explain in one sentence what EPSILON does and what it does **not** claim.
- At least five people outside the build process have given honest feedback or tried the product.
- At least two outsiders completed an evidence field and one substantive external challenge remains publicly linkable.

## Official platform references

- Product Hunt: https://www.producthunt.com/launch
- Product Hunt posting requirements: https://help.producthunt.com/en/articles/479557-how-to-post-a-product
- Show HN guide: https://news.ycombinator.com/showhn.html
- GitHub social preview: https://docs.github.com/en/repositories/managing-your-repositorys-settings-and-features/customizing-your-repository/customizing-your-repositorys-social-media-preview

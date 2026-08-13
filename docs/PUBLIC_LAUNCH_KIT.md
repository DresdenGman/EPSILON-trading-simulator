# EPSILON public launch kit

This is the source of truth for communicating EPSILON publicly. It exists to make the project easier to discover without turning a research product into an overclaim.

## The one-sentence position

**EPSILON is a quantitative decision lab that turns a market idea into a falsifiable research loop: observe, test, challenge, and retest.**

## The problem it names

Most backtesting tools give a performance output. They make it easy to forget the assumptions, missing provenance, execution model, and rejection rule that determine what the output actually means.

EPSILON keeps those boundaries attached to the work. A changed question makes prior evidence stale; a failed retest remains visible; unknown data stays unknown.

## Demonstrated product facts

Only use these statements without additional qualification:

- The public web product has one research path: **Market → Strategy Lab → Interrogate**.
- A user can record a hypothesis and falsification condition before a backtest.
- A submitted result retains its configuration, metrics, trade ledger, and known/unknown provenance boundaries.
- Changing the subject, hypothesis, or rejection rule marks the prior artifact stale instead of silently replacing it.
- Guest sessions run browser-local simulations and clearly label them as controlled synthetic evidence.
- EPSILON is open source and its original desktop history remains in this repository.

## Claims that require evidence first

Do not use these until real user evidence exists:

- “Improves investment performance” or “finds alpha”
- “AI-powered investment advice”
- “Live market data” or “institutional-grade data”
- Any user, traffic, accuracy, profitability, or adoption number
- Any statement implying a result is historical validation, statistical significance, or general robustness

## Links

- Product: `https://epsilon-livid.vercel.app/landing`
- Working product: `https://epsilon-livid.vercel.app/dashboard`
- Repository: `https://github.com/DresdenGman/EPSILON-trading-simulator`
- Social preview asset: `website/public/social/epsilon-social-preview-v1.jpg`
- 30-second product video: `docs/media/epsilon-demo-30s/epsilon-decision-lab-30s.mp4`
- Video poster: `docs/media/epsilon-demo-30s/epsilon-decision-lab-30s-poster.jpg`

Before publishing, upload the preview asset through **Repository Settings → Social preview**. It is 1280 × 640 px and under 1 MB.

## First seven days

### Day 0 — make the links legible

1. Upload the GitHub social preview image.
2. Pin this repository on the author profile.
3. Confirm the landing page and dashboard links open in an incognito browser.
4. Record a baseline: GitHub stars, unique visitors, sign-ups (if any), qualitative feedback, and the number of people who complete one research loop.

### Days 1–3 — earn feedback before announcing a launch

Share one short build note with people who can give concrete feedback: quantitative-research learners, technical founders, open-source maintainers, and people who have actually used backtests.

Ask one question only:

> Where does the research loop become unclear, incomplete, or too easy to misread?

Do not ask for stars, upvotes, or shares. Ask for a five-minute use and an honest reply.

### Days 4–5 — publish the technical story

Publish a concise post explaining the narrow problem:

> A backtest can produce a number while hiding the conditions under which that number stops meaning what you think it means.

Link to the live workspace and repository. Include one short screen recording of the flow from hypothesis to stale evidence after a question changes.

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
> EPSILON has one workflow: choose a market subject, write a hypothesis and falsification condition, run a controlled test, inspect the stored configuration and provenance, then challenge the interpretation. If the subject or question changes, the earlier artifact becomes stale rather than being overwritten.
>
> The guest mode uses a clearly labeled browser-local synthetic simulation. It does not claim live data, historical validity, profitability, or investment advice.
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
- The three product surfaces can be used without a required account.
- The latest production deployment has passed the test suite and production build.
- The launch post links to a real working product, not a prototype route.
- A new visitor can explain in one sentence what EPSILON does and what it does **not** claim.
- At least five people outside the build process have given honest feedback or tried the product.

## Official platform references

- Product Hunt: https://www.producthunt.com/launch
- Product Hunt posting requirements: https://help.producthunt.com/en/articles/479557-how-to-post-a-product
- Show HN guide: https://news.ycombinator.com/showhn.html
- GitHub social preview: https://docs.github.com/en/repositories/managing-your-repositorys-settings-and-features/customizing-your-repository/customizing-your-repositorys-social-media-preview

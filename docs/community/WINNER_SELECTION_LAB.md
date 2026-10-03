# The winner you were shown: a 15-minute selection-bias lab

**Synthetic teaching exercise. No real market data, returns or trading results.**
This supplements the Assumption Clinic with the multiple-testing question its
five perturbations do not answer. It is not a reproduction of fixed case 001.

Python 3.10+; no packages, accounts or data-provider credentials:

```bash
python teaching/selection_bias.py --candidates 100 --seed 20261003 > selection-report.json
python -m unittest discover -s teaching -p test_selection_bias.py
```

Each candidate is an independent standard-normal null score. The program picks
the largest training score, then inspects a separately generated holdout score
for that same candidate. All scores remain in the report so the selection
history is visible. No candidate has true predictive skill in this model.

At one-sided alpha 0.05, the probability that at least one of 100 independent
null candidates looks nominally positive is `1 − 0.95^100`, approximately 99.4%.
This is an exact probability under the toy assumptions, not an empirical claim
about financial strategies. The selected winner's ordinary training p-value
does not account for selection. Correlated real strategies require different
analysis; counting them as independent can overstate the number of trials.

## Facilitation and worksheet

1. **0–3 minutes:** Ask what a small p-value means if one candidate was chosen
   in advance. Before running, record the seed, candidate count and alpha.
2. **3–7 minutes:** Show only `train_selected_winner`. Ask what evidence is
   missing. Then reveal `all_candidates` and the exact family probability.
3. **7–11 minutes:** Reveal that winner's holdout. It can fail or pass by
   chance; keep the outcome either way. Do not search for a seed with a more
   persuasive story.
4. **11–15 minutes:** Give a new scenario: a researcher tried 20 datasets,
   several windows and 50 thresholds, but reported one curve. Ask what records
   would make the claim inspectable and which data remain untouched.

```text
Predeclared seed / candidate count / alpha:
Evidence shown before selection history was revealed:
Number of attempted candidates:
Preselected candidate vs training winner:
Winner's independent holdout result:
What the nominal training p-value does not establish:
Why changing the seed after viewing holdout would matter:
One hidden choice in the new scenario:
One limitation of this synthetic model:
Report scores_sha256:
```

The artifact hash identifies these generated scores, not a third-party
preregistration or a historical-data fingerprint. Separate streams retain the
same existing candidates' scores when candidate count changes. Repeatedly
trying new counts or seeds after viewing holdout is still adaptive reuse.

The program is deterministic for a fixed implementation and Python random
generator; record the source revision and Python version when sharing results.
It makes no claim about market profitability or participant learning gains.

For a real session, retain actual attendance, completed worksheets, specific
criticism and resulting revisions with permission. Do not count a script run
by the author or an agent as an external user, classroom adoption or review.

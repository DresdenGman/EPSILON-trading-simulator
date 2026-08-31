# Contributing to EPSILON

EPSILON welcomes criticism before expansion. The most useful contribution is a result another person can inspect: a reproduction attempt, a methodological challenge, a failing test, or a correction.

## Choose a contribution path

- **Reproduce a fixed release:** use the Reproduction Report issue form. A mismatch and an inability to complete the procedure are both valid results.
- **Challenge the method:** use the Methodological Challenge issue form or [Falsification Challenge Discussion #8](https://github.com/DresdenGman/EPSILON-trading-simulator/discussions/8).
- **Fix code or documentation:** open an issue first when the change alters the evidence contract, data provenance, execution model, or public claims.

## Evidence standard

Please include:

1. the exact release, tag, or commit SHA;
2. your operating system and relevant runtime versions;
3. the command or public workflow you followed;
4. the observed result or failure;
5. the expected result and why;
6. an output file, artifact hash, log excerpt, or screenshot when useful.

Do not include API keys, passwords, private datasets, personal information, or brokerage credentials.

## Integrity rules

- Synthetic results must remain labeled synthetic.
- A sensitivity result is not a profitability, prediction, or general robustness claim.
- Negative and inconclusive results remain part of the public record.
- Do not solicit or coordinate Stars, votes, comments, or endorsements.
- Reviewers are quoted by name only with permission.

## Development checks

Before a pull request, run the relevant tests for the surface you changed. For the current web evidence instrument, the public acceptance criteria are a working no-login path, explicit provenance, a pre-specified rejection rule, and an exportable evidence artifact.

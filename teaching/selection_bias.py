"""Synthetic winner-selection lesson, not a trading backtest.

python teaching/selection_bias.py --candidates 100 --seed 20261003

Each candidate has an independent standard-normal score under the null.
Training and holdout streams are generated separately. Choose the winner from
training scores only, then inspect its independent holdout score.
"""
import argparse
import hashlib
import json
import math
import random
from statistics import NormalDist


def experiment(candidates=100, seed=20261003, alpha=.05):
    if isinstance(candidates, bool) or not isinstance(candidates, int) or not 1 <= candidates <= 10000:
        raise ValueError('candidates must be an integer between 1 and 10000')
    if isinstance(seed, bool) or not isinstance(seed, int):
        raise ValueError('seed must be an integer')
    if not math.isfinite(alpha) or not 0 < alpha < 1:
        raise ValueError('alpha must be finite and strictly between 0 and 1')
    # Separate seeds keep the holdout stream stable when candidate count changes.
    train_rng = random.Random(f'epsilon-selection-v1:train:{seed}')
    holdout_rng = random.Random(f'epsilon-selection-v1:holdout:{seed}')
    normal = NormalDist()
    rows = []
    for i in range(candidates):
        train, holdout = train_rng.gauss(0, 1), holdout_rng.gauss(0, 1)
        rows.append({'candidate': i+1, 'train_z': train, 'holdout_z': holdout,
                     'train_one_sided_p': .5*math.erfc(train/math.sqrt(2)),
                     'holdout_one_sided_p': .5*math.erfc(holdout/math.sqrt(2))})
    winner = max(rows, key=lambda row: row['train_z'])
    threshold = normal.inv_cdf(1-alpha)
    canonical = json.dumps(rows, sort_keys=True, separators=(',', ':'), allow_nan=False)
    return {
        'schema': 'epsilon-synthetic-selection-v1',
        'data_mode': 'synthetic independent standard-normal null scores',
        'seed': seed,
        'candidate_count': candidates,
        'one_sided_alpha': alpha,
        'nominal_z_threshold': threshold,
        'iid_family_probability_at_least_one_nominal_positive': -math.expm1(candidates*math.log1p(-alpha)),
        'preselected_candidate': rows[0],
        'train_selected_winner': winner,
        'nominal_train_positives': sum(row['train_one_sided_p'] <= alpha for row in rows),
        'winner_holdout_nominal_positive': winner['holdout_one_sided_p'] <= alpha,
        'scores_sha256': hashlib.sha256(canonical.encode()).hexdigest(),
        'all_candidates': rows,
        'limitations': [
            'Scores are synthetic; no prices, returns, trades, profits or market data are used.',
            'The exact family probability assumes independent candidates with valid uniform null p-values.',
            'Real strategies may be dependent, non-normal and selected through additional hidden choices.',
            'A holdout can also pass by chance; one rerun does not prove a generalization result.',
            'Choosing a new seed or candidate after inspecting holdout results invalidates the intended selection protocol.',
            'This is a teaching exercise, not measured educational impact or independent reproduction of case 001.',
        ],
    }


def main():
    parser = argparse.ArgumentParser(description=__doc__)
    parser.add_argument('--candidates', type=int, default=100)
    parser.add_argument('--seed', type=int, default=20261003)
    parser.add_argument('--alpha', type=float, default=.05)
    args = parser.parse_args()
    try:
        report = experiment(args.candidates, args.seed, args.alpha)
    except ValueError as error:
        parser.error(str(error))
    print(json.dumps(report, indent=2, allow_nan=False))


if __name__ == '__main__':
    main()

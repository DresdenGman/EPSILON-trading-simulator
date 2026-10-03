import unittest

from teaching.selection_bias import experiment


class SelectionBiasTests(unittest.TestCase):
    def test_exact_family_probability(self):
        one = experiment(1)
        hundred = experiment(100)
        self.assertAlmostEqual(one['iid_family_probability_at_least_one_nominal_positive'], .05)
        self.assertAlmostEqual(hundred['iid_family_probability_at_least_one_nominal_positive'], 1-.95**100)
        self.assertEqual(one['preselected_candidate'], one['train_selected_winner'])

    def test_winner_selected_only_from_training(self):
        result = experiment(100)
        expected = max(result['all_candidates'], key=lambda r: r['train_z'])
        self.assertEqual(result['train_selected_winner'], expected)
        self.assertEqual(result['winner_holdout_nominal_positive'], expected['holdout_one_sided_p'] <= .05)

    def test_more_candidates_do_not_change_existing_holdout_or_training_scores(self):
        small, large = experiment(10), experiment(100)
        self.assertEqual(small['all_candidates'], large['all_candidates'][:10])
        self.assertGreaterEqual(large['train_selected_winner']['train_z'], small['train_selected_winner']['train_z'])

    def test_reproducible_and_seed_sensitive(self):
        self.assertEqual(experiment(), experiment())
        self.assertNotEqual(experiment(seed=1)['scores_sha256'], experiment(seed=2)['scores_sha256'])

    def test_invalid_parameters(self):
        for candidates in [True, 0, -1, 10001, 1.5]:
            with self.subTest(candidates=candidates), self.assertRaises(ValueError):
                experiment(candidates=candidates)
        for alpha in [0, 1, -.1, float('nan'), float('inf')]:
            with self.subTest(alpha=alpha), self.assertRaises(ValueError):
                experiment(alpha=alpha)


if __name__ == '__main__':
    unittest.main()

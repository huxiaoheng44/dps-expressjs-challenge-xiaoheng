import { Router } from 'express';
import leaderboardService from '../services/leaderboard.service';

const router = Router();

router.get('/:id', (req, res) => {
	try {
		const data = leaderboardService.getTournamentLeaderboard(req.params.id);
		res.status(200).json(data);
	} catch (error) {
		const message =
			error instanceof Error ? error.message : 'Internal server error';

		if (message === 'Tournament not found') {
			res.status(404).json({ error: message });
			return;
		}

		res.status(500).json({ error: message });
	}
});

router.get('/', (req, res) => {
	try {
		const data = leaderboardService.getLeaderboardByName(
			req.query.name as string,
		);
		res.status(200).json(data);
	} catch (error) {
		const message =
			error instanceof Error ? error.message : 'Internal server error';
		res.status(500).json({ error: message });
	}
});

export default router;

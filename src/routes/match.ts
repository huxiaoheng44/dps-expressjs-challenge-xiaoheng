import { Router } from 'express';
import matchService from '../services/match.service';

const router = Router();

router.post('/', (req, res) => {
	const { tournamentId, player1Id, player2Id, winnerId } = req.body;
	try {
		const match = matchService.createMatch(
			tournamentId,
			player1Id,
			player2Id,
			winnerId,
		);
		res.status(201).json(match);
	} catch (error) {
		const message =
			error instanceof Error ? error.message : 'Internal server error';
		res.status(400).json({ error: message });
	}
});

router.get('/:id', (req, res) => {
	const match = matchService.getMatchById(req.params.id);
	if (!match) {
		res.status(404).json({ error: 'Match not found' });
		return;
	}
	res.json(match);
});

router.put('/:id', (req, res) => {
	const { player1Id, player2Id, winnerId } = req.body;
	try {
		const match = matchService.updateMatch(
			req.params.id,
			player1Id,
			player2Id,
			winnerId,
		);
		if (!match) {
			res.status(404).json({ error: 'Match not found' });
			return;
		}
		res.json(match);
	} catch (error) {
		const message =
			error instanceof Error ? error.message : 'Internal server error';
		res.status(400).json({ error: message });
	}
});

router.delete('/:id', (req, res) => {
	const success = matchService.deleteMatch(req.params.id);
	if (!success) {
		res.status(404).json({ error: 'Match not found' });
		return;
	}
	res.status(204).send();
});

export default router;

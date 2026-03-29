import { Router } from 'express';
import matchService from '../services/match.service';
import tournamentService from '../services/tournament.service';
import tournamentPlayerService from '../services/tournament-player.service';

const router = Router();

router.get('/', (req, res) => {
	res.status(200).json(tournamentService.getAllTournaments());
});

router.get('/:id', (req, res) => {
	const tournament = tournamentService.getTournamentById(req.params.id);
	if (!tournament) {
		res.status(404).json({ error: 'Tournament not found' });
		return;
	}
	res.status(200).json(tournament);
});

// create a new tournament
router.post('/', (req, res) => {
	const { name } = req.body;

	const tournament = tournamentService.createTournament(name);
	res.status(201).json(tournament);
});

// update tournament name
router.put('/:id', (req, res) => {
	const { name } = req.body;

	const tournament = tournamentService.updateTournamentName(
		req.params.id,
		name,
	);
	if (!tournament) {
		res.status(404).json({ error: 'Tournament not found' });
		return;
	}
	res.status(200).json(tournament);
});

router.get('/:id/players', (req, res) => {
	const tournament = tournamentService.getTournamentById(req.params.id);
	if (!tournament) {
		res.status(404).json({ error: 'Tournament not found' });
		return;
	}

	res.status(200).json(
		tournamentPlayerService.getPlayersByTournamentId(req.params.id),
	);
});

router.get('/:id/matches', (req, res) => {
	const tournament = tournamentService.getTournamentById(req.params.id);
	if (!tournament) {
		res.status(404).json({ error: 'Tournament not found' });
		return;
	}

	res.status(200).json(matchService.getMatchesByTournamentId(req.params.id));
});

// add players to a tournament
router.post('/:id/players', (req, res) => {
	const { playersList } = req.body;

	const uniquePlayerIds = [...new Set(playersList)] as string[];
	const added: unknown[] = [];
	const failed: { playerId: string; error: string }[] = [];

	for (const playerId of uniquePlayerIds) {
		try {
			const record = tournamentPlayerService.addPlayerToTournament(
				req.params.id,
				playerId,
			);
			added.push(record);
		} catch (error) {
			const message =
				error instanceof Error
					? error.message
					: 'Internal server error';
			failed.push({ playerId, error: message });
		}
	}

	if (failed.length === 0) {
		res.status(201).json({ added });
		return;
	}

	res.status(207).json({ added, failed });
});

// remove a player from a tournament
router.delete('/:id/players/:playerId', (req, res) => {
	const success = tournamentPlayerService.removePlayerFromTournament(
		req.params.id,
		req.params.playerId,
	);

	if (!success) {
		res.status(404).json({
			error: 'Tournament-player relationship not found',
		});
		return;
	}

	res.status(204).send();
});

// delete a tournament
router.delete('/:id', (req, res) => {
	matchService.deleteByTournamentId(req.params.id);
	tournamentPlayerService.deleteByTournamentId(req.params.id);
	const success = tournamentService.deleteTournament(req.params.id);
	if (!success) {
		res.status(404).json({ error: 'Tournament not found' });
		return;
	}
	res.status(200).json({ message: 'Tournament deleted successfully' });
});

export default router;

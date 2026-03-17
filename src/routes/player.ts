import { Router } from 'express';
import playerService from '../services/player.service';
import tournamentPlayerService from '../services/tournament-player.service';

const router = Router();

router.get('/', (req, res) => {
	res.status(200).json(playerService.getAllPlayers());
});

router.get('/:id', (req, res) => {
	const player = playerService.getPlayerById(req.params.id);
	if (!player) {
		res.status(404).json({ error: 'Player not found' });
		return;
	}
	res.status(200).json(player);
});

router.get('/:id/tournaments', (req, res) => {
	const player = playerService.getPlayerById(req.params.id);
	if (!player) {
		res.status(404).json({ error: 'Player not found' });
		return;
	}

	res.status(200).json(
		tournamentPlayerService.getTournamentsByPlayerId(req.params.id),
	);
});

// create a new player
router.post('/', (req, res) => {
	const { name } = req.body;
	const player = playerService.createPlayer(name);
	res.status(201).json(player);
});

// update player name
router.put('/:id', (req, res) => {
	const { name } = req.body;
	const player = playerService.updatePlayerName(req.params.id, name);
	if (!player) {
		res.status(404).json({ error: 'Player not found' });
		return;
	}
	res.status(200).json(player);
});

// delete a player
router.delete('/:id', (req, res) => {
	const success = playerService.deletePlayer(req.params.id);
	if (!success) {
		res.status(404).json({ error: 'Player not found' });
		return;
	}
	res.status(204).send();
});

export default router;

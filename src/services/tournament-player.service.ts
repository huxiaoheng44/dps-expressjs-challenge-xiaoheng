import { randomUUID } from 'crypto';
import db from './db.service';
import { Player as PlayerInTournament } from './player.service';
import { Tournament as TournamentForPlayer } from './tournament.service';

export type TournamentPlayer = {
	id: string;
	tournament_id: string;
	player_id: string;
	created_at: string;
};

type CountRow = {
	count: number;
};

function getPlayersByTournamentId(tournamentId: string): PlayerInTournament[] {
	return db.query(
		'SELECT p.id, p.name, tp.created_at FROM tournament_players tp INNER JOIN players p ON p.id = tp.player_id WHERE tp.tournament_id = @tournamentId ORDER BY tp.created_at ASC',
		{ tournamentId },
	) as PlayerInTournament[];
}

function getTournamentsByPlayerId(playerId: string): TournamentForPlayer[] {
	return db.query(
		'SELECT t.id, t.name, tp.created_at FROM tournament_players tp INNER JOIN tournaments t ON t.id = tp.tournament_id WHERE tp.player_id = @playerId ORDER BY tp.created_at ASC',
		{ playerId },
	) as TournamentForPlayer[];
}

function addPlayerToTournament(
	tournamentId: string,
	playerId: string,
): TournamentPlayer {
	const tournamentRows = db.query(
		'SELECT id FROM tournaments WHERE id = @id',
		{ id: tournamentId },
	);
	if (tournamentRows.length === 0) {
		throw new Error('Tournament not found');
	}

	const playerRows = db.query('SELECT id FROM players WHERE id = @id', {
		id: playerId,
	});
	if (playerRows.length === 0) {
		throw new Error('Player not found');
	}

	const existingRows = db.query(
		'SELECT id FROM tournament_players WHERE tournament_id = @tournamentId AND player_id = @playerId',
		{ tournamentId, playerId },
	);
	if (existingRows.length > 0) {
		throw new Error('Player already joined this tournament');
	}

	const countRows = db.query(
		'SELECT COUNT(*) as count FROM tournament_players WHERE tournament_id = @tournamentId',
		{ tournamentId },
	) as CountRow[];

	if (countRows[0]?.count >= 5) {
		throw new Error('Tournament can have at most 5 players');
	}

	const id = randomUUID();
	const createdAt = new Date().toISOString();

	db.run(
		'INSERT INTO tournament_players (id, tournament_id, player_id, created_at) VALUES (@id, @tournamentId, @playerId, @created_at)',
		{
			id,
			tournamentId,
			playerId,
			created_at: createdAt,
		},
	);

	const rows = db.query(
		'SELECT id, tournament_id, player_id, created_at FROM tournament_players WHERE id = @id',
		{ id },
	);
	const record = rows[0] as TournamentPlayer | undefined;
	if (!record) {
		throw new Error('Failed to add player to tournament');
	}

	return record;
}

function removePlayerFromTournament(
	tournamentId: string,
	playerId: string,
): boolean {
	const result = db.run(
		'DELETE FROM tournament_players WHERE tournament_id = @tournamentId AND player_id = @playerId',
		{ tournamentId, playerId },
	);
	return result.changes > 0;
}

function deleteByTournamentId(tournamentId: string): boolean {
	const result = db.run(
		'DELETE FROM tournament_players WHERE tournament_id = @tournamentId',
		{ tournamentId },
	);
	return result.changes > 0;
}

export default {
	getPlayersByTournamentId,
	getTournamentsByPlayerId,
	addPlayerToTournament,
	removePlayerFromTournament,
	deleteByTournamentId,
};

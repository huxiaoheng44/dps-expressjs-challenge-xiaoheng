import { randomUUID } from 'crypto';
import db from './db.service';

export type Match = {
	id: string;
	tournament_id: string;
	player1_id: string;
	player2_id: string;
	winner_id: string | null;
	created_at: string;
};

function normalizePlayers(player1Id: string, player2Id: string) {
	if (player1Id === player2Id) {
		throw new Error('Players must be different');
	}

	return [player1Id, player2Id].sort((a, b) => a.localeCompare(b));
}

function validateWinner(
	winnerId: string | null,
	player1Id: string,
	player2Id: string,
) {
	if (winnerId === null) {
		return;
	}

	if (winnerId !== player1Id && winnerId !== player2Id) {
		throw new Error(
			'winnerId must be one of player1Id, player2Id, or null',
		);
	}
}

function assertTournamentExists(tournamentId: string) {
	const rows = db.query('SELECT id FROM tournaments WHERE id = @id', {
		id: tournamentId,
	});
	if (rows.length === 0) {
		throw new Error('Tournament not found');
	}
}

function assertPlayerInTournament(tournamentId: string, playerId: string) {
	const rows = db.query(
		'SELECT id FROM tournament_players WHERE tournament_id = @tournamentId AND player_id = @playerId',
		{ tournamentId, playerId },
	);
	if (rows.length === 0) {
		throw new Error('Player is not in tournament');
	}
}

function getMatchById(id: string): Match | undefined {
	const rows = db.query(
		'SELECT id, tournament_id, player1_id, player2_id, winner_id, created_at FROM matches WHERE id = @id',
		{ id },
	);

	return rows[0] as Match | undefined;
}

function createMatch(
	tournamentId: string,
	player1Id: string,
	player2Id: string,
	winnerId: string | null = null,
): Match {
	assertTournamentExists(tournamentId);

	const [normalizedPlayer1, normalizedPlayer2] = normalizePlayers(
		player1Id,
		player2Id,
	);

	assertPlayerInTournament(tournamentId, normalizedPlayer1);
	assertPlayerInTournament(tournamentId, normalizedPlayer2);
	validateWinner(winnerId, normalizedPlayer1, normalizedPlayer2);

	const existingRows = db.query(
		'SELECT id FROM matches WHERE tournament_id = @tournamentId AND player1_id = @player1Id AND player2_id = @player2Id',
		{
			tournamentId,
			player1Id: normalizedPlayer1,
			player2Id: normalizedPlayer2,
		},
	);
	if (existingRows.length > 0) {
		throw new Error('Match already exists for this player pair');
	}

	const id = randomUUID();
	const createdAt = new Date().toISOString();

	db.run(
		'INSERT INTO matches (id, tournament_id, player1_id, player2_id, winner_id, created_at) VALUES (@id, @tournamentId, @player1Id, @player2Id, @winnerId, @created_at)',
		{
			id,
			tournamentId,
			player1Id: normalizedPlayer1,
			player2Id: normalizedPlayer2,
			winnerId,
			created_at: createdAt,
		},
	);

	const match = getMatchById(id);
	if (!match) {
		throw new Error('Failed to create match');
	}

	return match;
}

function updateMatch(
	matchId: string,
	player1Id: string,
	player2Id: string,
	winnerId: string | null,
): Match | undefined {
	const existing = getMatchById(matchId);
	if (!existing) {
		return undefined;
	}

	const [normalizedPlayer1, normalizedPlayer2] = normalizePlayers(
		player1Id,
		player2Id,
	);

	assertTournamentExists(existing.tournament_id);
	assertPlayerInTournament(existing.tournament_id, normalizedPlayer1);
	assertPlayerInTournament(existing.tournament_id, normalizedPlayer2);
	validateWinner(winnerId, normalizedPlayer1, normalizedPlayer2);

	const duplicateRows = db.query(
		'SELECT id FROM matches WHERE tournament_id = @tournamentId AND player1_id = @player1Id AND player2_id = @player2Id AND id != @id',
		{
			id: matchId,
			tournamentId: existing.tournament_id,
			player1Id: normalizedPlayer1,
			player2Id: normalizedPlayer2,
		},
	);

	if (duplicateRows.length > 0) {
		throw new Error('Match already exists for this player pair');
	}

	db.run(
		'UPDATE matches SET player1_id = @player1Id, player2_id = @player2Id, winner_id = @winnerId WHERE id = @id',
		{
			id: matchId,
			player1Id: normalizedPlayer1,
			player2Id: normalizedPlayer2,
			winnerId,
		},
	);

	return getMatchById(matchId);
}

function deleteMatch(id: string): boolean {
	const result = db.run('DELETE FROM matches WHERE id = @id', { id });
	return result.changes > 0;
}

function deleteByTournamentId(tournamentId: string): boolean {
	const result = db.run(
		'DELETE FROM matches WHERE tournament_id = @tournamentId',
		{
			tournamentId,
		},
	);
	return result.changes > 0;
}

function deleteByPlayerId(playerId: string): boolean {
	const result = db.run(
		'DELETE FROM matches WHERE player1_id = @playerId OR player2_id = @playerId',
		{ playerId },
	);
	return result.changes > 0;
}

function getMatchesByTournamentId(tournamentId: string): Match[] {
	return db.query(
		'SELECT id, tournament_id, player1_id, player2_id, winner_id, created_at FROM matches WHERE tournament_id = @tournamentId ORDER BY created_at ASC',
		{ tournamentId },
	) as Match[];
}

function getMatchesByPlayerId(playerId: string): Match[] {
	return db.query(
		'SELECT id, tournament_id, player1_id, player2_id, winner_id, created_at FROM matches WHERE player1_id = @playerId OR player2_id = @playerId ORDER BY created_at ASC',
		{ playerId },
	) as Match[];
}

export default {
	getMatchById,
	createMatch,
	updateMatch,
	deleteMatch,
	deleteByTournamentId,
	deleteByPlayerId,
	getMatchesByTournamentId,
	getMatchesByPlayerId,
};

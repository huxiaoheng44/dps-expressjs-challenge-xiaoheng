import db from './db.service';
import type { Match } from './match.service';
import type { Tournament } from './tournament.service';

type TournamentRow = Pick<Tournament, 'id' | 'name'>;

type TournamentPlayerRow = {
	player_id: string;
};

type MatchRow = Pick<Match, 'player1_id' | 'player2_id' | 'winner_id'>;

export type LeaderboardStatus = 'planning' | 'started' | 'finished';

export type LeaderboardEntry = {
	playerId: string;
	played: number;
	wins: number;
	draws: number;
	losses: number;
	points: number;
};

export type TournamentLeaderboard = {
	tournamentId: string;
	tournamentName: string;
	status: LeaderboardStatus;
	totalPlayers: number;
	totalMatches: number;
	playedMatches: number;
	leaderboard: LeaderboardEntry[];
};

function getTournamentLeaderboard(tournamentId: string): TournamentLeaderboard {
	const tournamentRows = db.query(
		'SELECT id, name FROM tournaments WHERE id = @id',
		{
			id: tournamentId,
		},
	) as TournamentRow[];

	if (tournamentRows.length === 0) {
		throw new Error('Tournament not found');
	}

	const tournament = tournamentRows[0];

	const players = db.query(
		'SELECT player_id FROM tournament_players WHERE tournament_id = @tournamentId',
		{ tournamentId },
	) as TournamentPlayerRow[];

	const matches = db.query(
		'SELECT player1_id, player2_id, winner_id FROM matches WHERE tournament_id = @tournamentId',
		{ tournamentId },
	) as MatchRow[];

	// initialize entries for all players
	const stats = new Map<string, LeaderboardEntry>();
	for (const player of players) {
		stats.set(player.player_id, {
			playerId: player.player_id,
			played: 0,
			wins: 0,
			draws: 0,
			losses: 0,
			points: 0,
		});
	}

	for (const match of matches) {
		const player1Entry = stats.get(match.player1_id);
		const player2Entry = stats.get(match.player2_id);

		if (!player1Entry || !player2Entry) {
			continue;
		}

		player1Entry.played += 1;
		player2Entry.played += 1;

		if (match.winner_id === null) {
			player1Entry.draws += 1;
			player2Entry.draws += 1;
			player1Entry.points += 1;
			player2Entry.points += 1;
			continue;
		}

		if (match.winner_id === match.player1_id) {
			player1Entry.wins += 1;
			player2Entry.losses += 1;
			player1Entry.points += 2;
			continue;
		}

		if (match.winner_id === match.player2_id) {
			player2Entry.wins += 1;
			player1Entry.losses += 1;
			player2Entry.points += 2;
		}
	}

	const totalPlayers = players.length;
	const totalMatches = (totalPlayers * (totalPlayers - 1)) / 2;
	const playedMatches = matches.length;

	const status: LeaderboardStatus =
		playedMatches === 0
			? 'planning'
			: playedMatches === totalMatches
				? 'finished'
				: 'started';

	// sort by points desc, then wins desc, then playerId asc
	const leaderboard = Array.from(stats.values()).sort((a, b) => {
		if (b.points !== a.points) {
			return b.points - a.points;
		}

		if (b.wins !== a.wins) {
			return b.wins - a.wins;
		}

		return a.playerId.localeCompare(b.playerId);
	});

	return {
		tournamentId,
		tournamentName: tournament.name,
		status,
		totalPlayers,
		totalMatches,
		playedMatches,
		leaderboard,
	};
}

function getLeaderboardByName(tournamentName: string): TournamentLeaderboard[] {
	const tournamentRows = db.query(
		'SELECT id FROM tournaments WHERE name = @name',
		{ name: tournamentName },
	) as Pick<Tournament, 'id'>[];

	return tournamentRows.map((tournament) =>
		getTournamentLeaderboard(tournament.id),
	);
}

export default {
	getTournamentLeaderboard,
	getLeaderboardByName,
};

import { randomUUID } from 'crypto';
import db from './db.service';

export type Tournament = {
	id: string;
	name: string;
	created_at: string;
};

function getAllTournaments(): Tournament[] {
	return db.query('SELECT * FROM tournaments') as Tournament[];
}

function getTournamentById(id: string): Tournament | undefined {
	const rows = db.query('SELECT * FROM tournaments WHERE id = @id', { id });
	return rows[0] as Tournament | undefined;
}

function createTournament(name: string): Tournament {
	const id = randomUUID();
	const createdAt = new Date().toISOString();
	db.run(
		'INSERT INTO tournaments (id, name, created_at) VALUES (@id, @name, @created_at)',
		{
			id,
			name,
			created_at: createdAt,
		},
	);

	const tournament = getTournamentById(id);
	if (!tournament) {
		throw new Error('Failed to create tournament');
	}

	return tournament;
}

function updateTournamentName(
	id: string,
	name: string,
): Tournament | undefined {
	db.run('UPDATE tournaments SET name = @name WHERE id = @id', { id, name });
	return getTournamentById(id);
}

function deleteTournament(id: string): boolean {
	const result = db.run('DELETE FROM tournaments WHERE id = @id', { id });
	return result.changes > 0;
}

export default {
	getAllTournaments,
	getTournamentById,
	createTournament,
	updateTournamentName,
	deleteTournament,
};

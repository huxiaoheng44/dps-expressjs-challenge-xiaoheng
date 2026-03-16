import { randomUUID } from 'crypto';
import db from './db.service';

export type Player = {
	id: string;
	name: string;
	created_at: string;
};

function getAllPlayers(): Player[] {
	return db.query('SELECT * FROM players') as Player[];
}

function getPlayerById(id: string): Player | undefined {
	const rows = db.query('SELECT * FROM players WHERE id = @id', { id });
	return rows[0] as Player | undefined;
}

function createPlayer(name: string): Player {
	const id = randomUUID();
	const createdAt = new Date().toISOString();

	db.run(
		'INSERT INTO players (id, name, created_at) VALUES (@id, @name, @created_at)',
		{
			id,
			name,
			created_at: createdAt,
		},
	);

	const player = getPlayerById(id);
	if (!player) {
		throw new Error('Failed to create player');
	}

	return player;
}

function updatePlayerName(id: string, name: string): Player | undefined {
	db.run('UPDATE players SET name = @name WHERE id = @id', { id, name });
	return getPlayerById(id);
}

function deletePlayer(id: string): boolean {
	const result = db.run('DELETE FROM players WHERE id = @id', { id });
	return result.changes > 0;
}

export default {
	getAllPlayers,
	getPlayerById,
	createPlayer,
	updatePlayerName,
	deletePlayer,
};

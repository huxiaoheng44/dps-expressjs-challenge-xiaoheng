const fs = require('fs');
const path = require('path');
const Database = require('better-sqlite3');

const dbDir = path.resolve(__dirname, '..', 'db');
const dbPath = path.join(dbDir, 'db.sqlite3');

if (!fs.existsSync(dbDir)) {
	fs.mkdirSync(dbDir, { recursive: true });
}

const db = new Database(dbPath);
db.pragma('foreign_keys = ON');

const resetAndCreateTablesSql = `

CREATE TABLE IF NOT EXISTS tournaments (
	id TEXT PRIMARY KEY,
	name TEXT NOT NULL,
	created_at DATETIME NOT NULL
);

CREATE TABLE IF NOT EXISTS players (
	id TEXT PRIMARY KEY,
	name TEXT NOT NULL,
	created_at DATETIME NOT NULL
);

CREATE TABLE IF NOT EXISTS tournament_players (
	id TEXT PRIMARY KEY,
	tournament_id TEXT NOT NULL,
	player_id TEXT NOT NULL,
	created_at DATETIME NOT NULL,
	UNIQUE (tournament_id, player_id),
	FOREIGN KEY (tournament_id) REFERENCES tournaments(id),
	FOREIGN KEY (player_id) REFERENCES players(id)
);

CREATE TABLE IF NOT EXISTS matches (
	id TEXT PRIMARY KEY,
	tournament_id TEXT NOT NULL,
	player1_id TEXT NOT NULL,
	player2_id TEXT NOT NULL,
	winner_id TEXT NULL,
	created_at DATETIME NOT NULL,
	UNIQUE (tournament_id, player1_id, player2_id),
	FOREIGN KEY (tournament_id) REFERENCES tournaments(id),
	FOREIGN KEY (player1_id) REFERENCES players(id),
	FOREIGN KEY (player2_id) REFERENCES players(id),
	FOREIGN KEY (winner_id) REFERENCES players(id) 
);
`;

try {
	db.exec(resetAndCreateTablesSql);
	console.log('Database reset and initialized successfully at:', dbPath);
} catch (error) {
	console.error('Failed to initialize database:', error);
	process.exitCode = 1;
} finally {
	db.close();
}

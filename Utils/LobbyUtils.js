/*
CREATE TABLE IF NOT EXISTS GameLobbies (
	id TEXT NOT NULL PRIMARY KEY,

	owner_id TEXT, -- NULL at creation, set to user_id directly after creation
	game TEXT NOT NULL,
	max_players INTEGER NOT NULL,

	-- Private lobbies are not listed in the lobby list
	-- You must have the exact code to join
	private INTEGER NOT NULL DEFAULT 0,

	in_progress INTEGER NOT NULL DEFAULT 0, -- cannot join lobbies after game starts
	allow_spectators INTEGER NOT NULL DEFAULT 0, -- allow spectators to join after game starts

	FOREIGN KEY (owner) REFERENCES Users(id) ON DELETE CASCADE
) STRICT;

CREATE TABLE IF NOT EXISTS Players (
	lobby_id TEXT NOT NULL,
	user_id TEXT NOT NULL UNIQUE, -- players can only be in one lobby at a time

	PRIMARY KEY (lobby_id, user_id),
	FOREIGN KEY (lobby_id) REFERENCES GameLobbies(id) ON DELETE CASCADE,
	FOREIGN KEY (user_id) REFERENCES Users(user_id) ON DELETE CASCADE
) STRICT;
*/

const Database = require("../Database");
const GameList = require("./GameList");

// XXX-XXX-XXX
// reduced set to help with confusion
const CHARS = 'ABCDEFGHKLMNPQRSTVWXYZ23456789';
function CreateLobbyCode() {
	const code = [];
	for (let i = 0; i < 3; i++) {
		code.push(
			CHARS[ ~~(Math.random() * CHARS.length) ] +
			CHARS[ ~~(Math.random() * CHARS.length) ] +
			CHARS[ ~~(Math.random() * CHARS.length) ]
		)
	}
	return code.join('-');
}

function FetchLobby(id) {
	const lobbyData = Database.prepare(`
		SELECT *
		FROM GameLobbies
		WHERE id = ?
	`).get(id);
	if (!lobbyData) return null;

	const players = Database.prepare(`
		SELECT Players.user_id, username
		FROM Players
		JOIN Users ON Players.user_id = Users.user_id
		WHERE lobby_id = ?
	`).all(id);

	return {
		id: lobbyData.id,
		game: lobbyData.game,
		max_players: lobbyData.max_players,

		owner_id: lobbyData.owner_id,

		player_count: players.length,

		players: players, // { user_id, username }[]
		in_progress: !!lobbyData.in_progress,
		private: !!lobbyData.private
	};
}

function CreateLobby(game, maxPlayers, private) {
	if (!GameList.has(game)) throw new Error(`Unknown game: ${game}`);

	const id = CreateLobbyCode();

	Database.prepare(`
		INSERT INTO GameLobbies (id, game, max_players, private)
		VALUES (?, ?, ?, ?)
	`).run(id, game, maxPlayers, +private);

	return id;
}

function ListLobbies() {
	return Database.prepare(`
		SELECT id, game, max_players, private,
		    (SELECT COUNT(*) FROM Players WHERE lobby_id = GameLobbies.id) AS player_count
		FROM GameLobbies
		WHERE in_progress = 0
		AND private = 0
	`).all();
}

module.exports = {
	CreateLobby,
	ListLobbies,
	FetchLobby
}

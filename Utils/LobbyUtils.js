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

	join_order INTEGER NOT NULL UNIQUE, -- MAX(join_order) + 1 for new players

	PRIMARY KEY (lobby_id, user_id),

	FOREIGN KEY (lobby_id) REFERENCES GameLobbies(id) ON DELETE CASCADE,
	FOREIGN KEY (user_id) REFERENCES Users(id) ON DELETE CASCADE
) STRICT;
*/

const Database = require("../Database");

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

function CreateLobby(game, maxPlayers, private) {
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
	ListLobbies
}

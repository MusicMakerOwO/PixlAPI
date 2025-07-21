const Database = require("../Database");
const GameList = require("./GameList");
const GenerateCode = require("./GenerateCode");

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
	if (!lobbyData) throw new Error('Lobby not found');

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

function JoinLobby(lobbyID, userID, username) {
	const CurrentLobby = Database.prepare(`
		SELECT lobby_id FROM Players WHERE user_id = ?
	`).pluck().get(userID);

	if (CurrentLobby) {
		if (CurrentLobby !== lobbyID) {
			throw new Error('You are already in another lobby.');
		} else {
			const token = Database.prepare(`
				SELECT token FROM Users WHERE user_id = ?
			`).pluck().get(userID);
			return String(token);
		}
	}

	const lobby = FetchLobby(lobbyID);
	if (!lobby) throw new Error('Lobby not found');
	if (lobby.in_progress) throw new Error('Game has already started');
	if (lobby.player_count >= lobby.max_players) throw new Error('Lobby is full');

	const token = GenerateCode(16);
	Database.prepare(`
		INSERT INTO Users (user_id, username, token)
		VALUES (?, ?, ?)
		ON CONFLICT(user_id) DO UPDATE SET
			username = excluded.username,
			token = excluded.token
	`).run(userID, username, token);

	Database.prepare(`
        INSERT INTO Players (lobby_id, user_id)
        VALUES (?, ?)
        ON CONFLICT(lobby_id, user_id) DO NOTHING
	`).run(lobbyID, userID);

	return token;
}

function DeleteLobby(id) {
	Database.prepare(`
		DELETE FROM GameLobbies WHERE id = ?
	`).run(id);

	Database.prepare(`
		DELETE FROM Players WHERE lobby_id = ?
	`).run(id);
}

function LeaveLobby(token) {
	const userID = Database.prepare(`
		SELECT user_id FROM Users WHERE token = ?
	`).pluck().get(token);
	if (!userID) throw new Error('Invalid token');

	const lobbyID = Database.prepare(`
		SELECT lobby_id FROM Players WHERE user_id = ?
	`).pluck().get(userID);
	if (!lobbyID) throw new Error('You are not in a lobby');

	const lobby = FetchLobby(lobbyID);

	if (lobby.players.length <= 1) {
		// If the player is the last one in the lobby, delete the lobby
		DeleteLobby(lobbyID);
	} else {
		// Remove the player from the lobby, choose a new owner if necessary
		Database.prepare(`
			DELETE FROM Players WHERE user_id = ? AND lobby_id = ?
		`).run(userID, lobbyID);
		Database.prepare(`
			UPDATE GameLobbies
			SET owner_id = (SELECT user_id FROM Players WHERE lobby_id = ? LIMIT 1)
			WHERE id = ?
		`).run(lobbyID, lobbyID);
	}
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
	FetchLobby,
	JoinLobby,
	LeaveLobby,
	DeleteLobby
}

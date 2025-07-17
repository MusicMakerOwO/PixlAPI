const Database = require('../../Database');
const { FetchLobby } = require('../../Utils/LobbyUtils');
const GenerateCode = require('../../Utils/GenerateCode.js');

module.exports = {
	method: 'POST',
	route: '/lobby/join',
	params: {
		lobby_id: 'string',
		user_id: 'string',
		username: 'string' // the name to display in the lobby
	},
	handler: async (req) => {
		const lobbyID = req.body.lobby_id.toUpperCase().trim();
		const userID = req.body.user_id.trim();
		const username = req.body.username.trim();

		const CurrentLobby = Database.prepare(`
			SELECT lobby_id FROM Players WHERE user_id = ?
		`).pluck().get(userID);

		if (CurrentLobby) {
			if (CurrentLobby !== lobbyID) {
				return { status: 400, message: 'You are already in another lobby.' };
			} else {
				const token = Database.prepare(`
                    SELECT token
                    FROM Users
                    WHERE user_id = ?
				`).pluck().get(userID);
				return {
					status: 200,
					token: token,
					player_count: FetchLobby(lobbyID).player_count,
					max_players: FetchLobby(lobbyID).max_players,
				};
			}
		}

		const lobby = FetchLobby(lobbyID);
		if (!lobby) {
			return { status: 404, message: 'Lobby not found' };
		}
		if (lobby.in_progress) {
			return { status: 400, message: 'Game has already started' };
		}
		if (lobby.player_count >= lobby.max_players) {
			return { status: 400, message: 'Lobby is full' };
		}

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

		return {
			status: 200,
			token: token,
			player_count: lobby.player_count + 1,
			max_players: lobby.max_players,
		}
	}
}

const { JoinLobby } = require('../../Utils/LobbyUtils');
const Database = require("../../Database");

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

		try {
			const token = JoinLobby(lobbyID, userID, username);
			const { max_players, player_count } = Database.prepare(`
				SELECT max_players,
				    ( SELECT COUNT(*) FROM Players WHERE lobby_id = ? ) AS player_count
				FROM GameLobbies
				WHERE id = ?
			`).get(lobbyID);
			return {
				status: 200,
				token: token,
				lobby_id: lobbyID,
				max_players: max_players,
				player_count: player_count
			};
		} catch (error) {
			return { status: 400, message: error.message };
		}
	}
}

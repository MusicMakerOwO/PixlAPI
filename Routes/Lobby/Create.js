const { CreateLobby } = require("../../Utils/LobbyUtils")

module.exports = {
	method: 'POST',
	route: '/lobby/create',
	params: {
		game: 'string',
		max_players: 'number',
		private: 'boolean',
	},
	handler: async (req) => {
		const game = req.body.game.trim();
		const maxPlayers = Math.max(2, Math.min(100, parseInt(req.body.max_players)));
		const privateLobby = !!req.body.private;

		const lobbyID = CreateLobby(game, maxPlayers, privateLobby);

		return { status: 200, lobby_id: lobbyID };
	}
}

import GameList from '../../Utils/GameList';
import {CreateLobby} from '../../Utils/LobbyUtils';
import {IEndpoint} from '../../types';
import {Request} from 'express';

export default <IEndpoint>{
	method: 'POST',
	route: '/lobby/create',
	params: {
		game: 'string',
		max_players: 'number',
		private: 'boolean',
	},
	handler: async (req: Request) => {
		const game = req.body.game.trim();
		const maxPlayers = Math.max(2, Math.min(100, parseInt(req.body.max_players)));
		const privateLobby = !!req.body.private;

		const gameData = GameList.get(game);
		if (!gameData) {
			return { status: 404, message: `Unknown game: ${game}` };
		}

		if (maxPlayers < gameData.players.min || maxPlayers > gameData.players.max) {
			return {
				status: 400,
				message: `Invalid number of players - Must be between ${gameData.players.min} and ${gameData.players.max}`
			};
		}

		const lobbyID = CreateLobby(game, maxPlayers, privateLobby);

		return { status: 200, lobby_id: lobbyID };
	}
}
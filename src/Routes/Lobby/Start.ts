import Database from '../../Database';
import {FetchLobby} from '../../Utils/LobbyUtils';
import GameList from '../../Utils/GameList';
import {ACTIVE_GAMES} from '../../Constants.js';
import {IEndpoint} from '../../types.js';
import {Request} from 'express';

export default <IEndpoint>{
	method: 'POST',
	route: '/lobby/start',
	params: {
		token: 'string',
	},
	handler: async (req: Request) => {
		const token = req.body.token.trim();
		const userID = Database.prepare<string>(`
			SELECT user_id FROM Users WHERE token = ?
		`).pluck().get(token);
		if (!userID) return { status: 400, message: 'Invalid token' };

		const lobbyID = Database.prepare<string>(`
			SELECT lobby_id FROM Players WHERE user_id = ?
		`).pluck().get(userID);
		if (!lobbyID) return { status: 400, message: 'You are not in a lobby' };

		const lobby = FetchLobby(lobbyID);
		if (lobby.in_progress) return { status: 400, message: 'Game already in progress' };

		const GameHandler = GameList.get(lobby.game);
		if (!GameHandler) return { status: 404, message: 'Game not found' };

		const GameState = new GameHandler(lobbyID, lobby.players.map(p => p.user_id), lobby.max_players);
		ACTIVE_GAMES.set(lobbyID, GameState);

		const intialState = GameState.getInitialState();

		Database.prepare(`
			UPDATE GameLobbies SET in_progress = 1 WHERE id = ?
		`).run(lobbyID);

		return intialState ?
			{ status: 200, game_state: intialState } :
			{ status: 500, message: 'Failed to start game' };
	}
}
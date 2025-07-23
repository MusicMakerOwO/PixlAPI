import {JoinLobby} from '../../Utils/LobbyUtils';
import Database from '../../Database';
import {IEndpoint} from '../../types';
import {Request} from 'express';

export default <IEndpoint>{
	method: 'POST',
	route: '/lobby/join',
	params: {
		lobby_id: 'string',
		user_id: 'string',
		username: 'string' // the name to display in the lobby
	},
	handler: async (req: Request) => {
		const lobbyID = req.body.lobby_id.toUpperCase().trim();
		const userID = req.body.user_id.trim();
		const username = req.body.username.trim();

		const token = JoinLobby(lobbyID, userID, username);
		const playerData = Database.prepare<{
			max_players: number,
			player_count: number
		}>(`
			SELECT max_players,
			( SELECT COUNT(*) FROM Players WHERE lobby_id = ? ) AS player_count
			FROM GameLobbies
			WHERE id = ?
		`).get(lobbyID);
		if (!playerData) {
			return {
				status: 404,
				message: `Lobby ${lobbyID} not found`
			};
		}

		return {
			status: 200,
			token: token,
			lobby_id: lobbyID,
			max_players: playerData.max_players,
			player_count: playerData.player_count
		};
	}
}
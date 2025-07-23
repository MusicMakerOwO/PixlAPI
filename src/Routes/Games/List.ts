import GameList from '../../Utils/GameList';
import {IEndpoint} from "../../types";

export default {
	method: 'GET',
	route: '/games/list',
	handler: async () => {
		return {
			status: 200,
			games: Object.fromEntries(GameList) // Map -> Record
		}
	}
} as IEndpoint;
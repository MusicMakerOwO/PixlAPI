import GameList from '../../Utils/GameList';
import {IEndpoint} from "../../types";

// Simple form of memoization
const PrettyGameList: Array<{ name: string, description: string, players: { min: number, max: number } }> = [];
for (const gameName in GameList) {
	const game = GameList.get(gameName)!;
	PrettyGameList.push({
		name: game.name,
		description: game.description,
		players: game.players
	})
}

export default {
	method: 'GET',
	route: '/games/list',
	handler: async () => {
		return {
			status: 200,
			games: PrettyGameList
		}
	}
} as IEndpoint;
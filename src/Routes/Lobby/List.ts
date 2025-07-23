import {ListLobbies} from "../../Utils/LobbyUtils";
import {IEndpoint} from "../../types";

export default {
	method: 'GET',
	route: '/lobby/list',
	handler: async () => {
		const lobbies = ListLobbies();

		return {
			status: 200,
			lobbies: lobbies
		}
	}
} as IEndpoint;
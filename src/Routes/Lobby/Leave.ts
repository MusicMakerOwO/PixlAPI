import {IEndpoint} from "../../types";
import {LeaveLobby} from "../../Utils/LobbyUtils";
import {Request} from "express";

export default {
	method: 'POST',
	route: '/lobby/leave',
	params: {
		token: 'string',
	},
	handler: async (req: Request) => {
		LeaveLobby( req.body.token.trim() );
		return { status: 200 }
	}
} as IEndpoint;
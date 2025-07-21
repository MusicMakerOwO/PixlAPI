const { LeaveLobby } = require("../../Utils/LobbyUtils");
module.exports = {
	method: 'POST',
	route: '/lobby/leave',
	params: {
		token: 'string',
	},
	handler: async (req) => {
		LeaveLobby( req.body.token.trim() );
		return { status: 200 }
	}
}

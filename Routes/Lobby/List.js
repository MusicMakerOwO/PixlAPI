const { ListLobbies } = require('../../Utils/LobbyUtils');

module.exports = {
	method: 'GET',
	route: '/lobby/list',
	handler: async () => {
		const lobbies = ListLobbies();

		return {
			status: 200,
			lobbies: lobbies
		}
	}
}

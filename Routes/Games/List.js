const GameList = require('../../Utils/GameList');

module.exports = {
	method: 'GET',
	route: '/games/list',
	handler: async () => {
		return {
			status: 200,
			games: Array.from(GameList.values())
		}
	}
}

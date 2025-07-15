module.exports = class Game {
	constructor(lobby_id = '', players = [''], max_players = {min: 2, max: 4}) {
		if (typeof lobby_id !== 'string') throw new Error(`Invalid lobby ID - expected string, got ${typeof lobby_id}`);

		if (typeof max_players !== 'object' || !max_players) throw new Error(`Invalid max_players - expected object, got ${typeof max_players}`);
		if (typeof max_players.min !== 'number' || typeof max_players.max !== 'number') {
			throw new Error(`Invalid max_players - expected object with { min: number, max: number }, got ${JSON.stringify(max_players)}`);
		}

		if (!Array.isArray(players)) throw new Error('Invalid players - Must be an array');
		const playerSet = new Set();
		for (let i = 0; i < players.length; i++) {
			if (typeof players[i] !== 'string') throw new Error(`Invalid player at index ${i} - expected string, got ${typeof players[i]}`);
			if (playerSet.has(players[i])) throw new Error(`Duplicate player ID found: ${players[i]} at index ${i}`);
			playerSet.add(players[i]);
		}
		players = Array.from(playerSet); // Ensure unique players

		this.lobby_id = lobby_id; // XXX-XXX-XXX
		this.players = players; // user_id[] (string[])

		this.turn = 0; // index of the current player in this.players
	}

	getPlayerByTurn(turn = this.turn) {
		return this.players[turn % this.players.length];
	}

	nextTurn() {
		this.turn = (this.turn + 1) % this.players.length;
		return this.getPlayerByTurn(this.turn);
	}

	prevTurn() {
		this.turn = (this.turn - 1 + this.players.length) % this.players.length;
		return this.getPlayerByTurn(this.turn);
	}

	removePlayer(user_id) {
		if (this.players.length <= 2) {
			throw new Error('Cannot remove player - at least 2 players are required. Did you mean to end the game?');
		}
		this.players = this.players.filter(player => player !== user_id);
	}

	playerCanMove(user_id) {
		return this.getPlayerByTurn() === user_id;
	}

	destroy() {
		this.lobby_id = null;
		this.players.length = 0;
	}
}

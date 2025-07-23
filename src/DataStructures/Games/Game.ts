export default class Game {
	lobby_id: string; // XXX-XXX-XXX
	players: string[]; // user_id[] (string[])
	turn: number; // index of the current player in this.players
	constructor(lobby_id: string, players: string[], playerLimit: {min: number, max: number}) {
		const playerSet = new Set<string>();
		for (let i = 0; i < players.length; i++) {
			if (playerSet.has(players[i])) throw new Error(`Duplicate player ID found: ${players[i]} at index ${i}`);
			playerSet.add(players[i]);
		}
		players = Array.from<string>(playerSet); // Ensure unique players

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

	removePlayer(user_id: string) {
		if (this.players.length <= 2) {
			throw new Error('Cannot remove player - at least 2 players are required. Did you mean to end the game?');
		}
		this.players = this.players.filter(player => player !== user_id);
	}

	playerCanMove(user_id: string) {
		return this.getPlayerByTurn() === user_id;
	}

	destroy() {
		this.players.length = 0;
	}
}
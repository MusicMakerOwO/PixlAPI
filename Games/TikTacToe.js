const Table2d = require("../DataStructures/Table2d");
const Game = require("../DataStructures/Games/Game");
module.exports = class TikTacToe extends Game {

	static name = "TikTacToe";
	static description = "Class TikTacToe for 2 players";
	static players = { min: 2, max: 2 };

	static PIECES = {
		X: 1,
		O: 0
	}

	static ACTIONS = {
		PLACE: {
			id: 'PLACE',
			name: 'Place Piece',
			params: {
				x: { type: 'number', min: 0, max: 2 },
				y: { type: 'number', min: 0, max: 2 }
			}
		}
	}

	static WINNING_CONDITIONS = [
		// Rows
		[
			[0, 0], [0, 1], [0, 2], // Row 1
			[1, 0], [1, 1], [1, 2], // Row 2
			[2, 0], [2, 1], [2, 2] // Row 3
		],
		// Columns
		[
			[0, 0], [1, 0], [2, 0], // Column 1
			[0, 1], [1, 1], [2, 1], // Column 2
			[0, 2], [1, 2], [2, 2] // Column 3
		],
		// Diagonals
		[
			[0, 0], [1, 1], [2, 2], // Top-left to bottom-right
			[0, 2], [1, 1], [2, 0] // Top-right to bottom-left
		]
	];

	constructor(lobby_id, players) {
		super(lobby_id, players, TikTacToe.players);

		this.board = new Table2d(3, 3).fill(null);
	}

	getBoard(user_id) {
		return this.board.toArray();
	}

	// Returns an array of available moves for the current player, empty array if no moves are available
	availableActions(user_id) {
		return super.playerCanMove(user_id) ? Object.values(TikTacToe.ACTIONS) : [];
	}

	availableMoves(user_id) {
		if (!super.playerCanMove(user_id)) return [];
		const moves = [];
		for (let y = 0; y < 3; y++) {
			for (let x = 0; x < 3; x++) {
				if (this.board.get(y, x) === null) {
					moves.push({x, y});
				}
			}
		}
		return moves;
	}

	checkWin() {
		let winner = null;
		for (const conditions of TikTacToe.WINNING_CONDITIONS) {
			const [a, b, c] = conditions;

			const pieceA = this.board.get(a[0], a[1]);
			if (pieceA === null) continue; // Skip if the first piece is null

			const pieceB = this.board.get(b[0], b[1]);
			if (pieceB === null || pieceB !== pieceA) continue; // Skip if the second piece is null or does not match the first

			const pieceC = this.board.get(c[0], c[1]);
			if (pieceC === null || pieceC !== pieceB) continue; // Skip if the third piece is null or does not match the second

			// transitive property: if A == B and B == C, then A == C
			winner = pieceA; // PIECES.X | PIECES.O
		}
		return {
			winner: winner === null ? null : this.getPlayerByTurn(+(winner === TikTacToe.PIECES.X)), // Resolve piece to player ID
			gameover: Boolean(winner || this.board.toArray().flat().every(cell => cell !== null)) // If all cells are filled, it's a draw
		}
	}

	move(user_id, action, reqBody) {
		if (!super.playerCanMove(user_id)) throw new Error(`Player ${user_id} cannot move right now - Not their turn`);

		switch (action) {
			case TikTacToe.ACTIONS.PLACE: {
				const { x, y } = reqBody;
				if (x < 0 || x > 2 || y < 0 || y > 2) {
					throw new Error(`Coordinates out of bounds: ${x}, ${y} - Expected values between 0 and 2`);
				}

				if (this.board.get(y, x) !== null) {
					throw new Error(`Cell at (${x}, ${y}) is already occupied`);
				}

				if (!this.availableActions(user_id).includes(TikTacToe.ACTIONS.PLACE)) {
					throw new Error(`Action "${action}" is not available`);
				}

				const piece = this.turn % 2 === 0 ? TikTacToe.PIECES.X : TikTacToe.PIECES.O;
				this.board.set(y, x, piece);

				const result = this.checkWin();
				if (result.gameover) {
					this.destroy(); // End the game
					return result;
				} else {
					this.nextTurn(); // Move to the next player
					return {
						... result,
						next_turn: this.getPlayerByTurn(),
						display: {
							global: this.display(),
						},
						available_actions: this.availableActions(this.getPlayerByTurn()),
						available_moves: this.availableMoves(this.getPlayerByTurn())
					};
				}
			}
			default:
				throw new Error(`Unknown action: ${action}`);
		}
	}
}

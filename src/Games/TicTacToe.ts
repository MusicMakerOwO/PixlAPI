import Table2d from '../DataStructures/Table2d.js';
import Game from '../DataStructures/Games/Game.js';
import {Request} from 'express';
import {Action, BoardDisplay, GameMovementResponse, GameOverResponse, IGameInstance, NumberParam} from '../types.js';

export default class TicTacToe extends Game implements IGameInstance {

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
				x: { type: 'number', min: 0, max: 2, required: true } as NumberParam,
				y: { type: 'number', min: 0, max: 2, required: true } as NumberParam
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

	board: Table2d<number | null>; // 3x3 board, null for empty cells, PIECES.X or PIECES.O for occupied cells
	constructor(lobby_id: string, players: string[]) {
		super(lobby_id, players, TicTacToe.players);

		this.board = new Table2d<number | null>(3, 3).fill(null);
	}

	getInitialState() {
		return {
			global: this.display(),
		}
	}

	display(): BoardDisplay {
		return {
			type: 'board',
			pieces: {
				[TicTacToe.PIECES.X]: 'X',
				[TicTacToe.PIECES.O]: 'O'
			},
			board: this.board.toArray()
		}
	}

	availableActions(user_id: string): Array<Action> {
		// TODO
		return [];
	}

	checkWin(): { winner: string | null; gameover: boolean } {
		let winner: number | null = null;
		for (const conditions of TicTacToe.WINNING_CONDITIONS) {
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
			winner: winner === null ? null : this.getPlayerByTurn(+(winner === TicTacToe.PIECES.X)), // Resolve piece to player ID
			gameover: Boolean(winner || this.board.toArray().flat().every(cell => cell !== null)) // If all cells are filled, it's a draw
		}
	}

	async move(user_id: string, action: string, reqBody: Request['body']): Promise<GameMovementResponse | GameOverResponse> {
		if (!super.playerCanMove(user_id)) throw new Error(`Player ${user_id} cannot move right now - Not their turn`);

		switch (action) {
			case TicTacToe.ACTIONS.PLACE.id: {
				const { x, y } = reqBody;
				if (x < 0 || x > 2 || y < 0 || y > 2) {
					throw new Error(`Coordinates out of bounds: ${x}, ${y} - Expected values between 0 and 2`);
				}

				if (this.board.get(y, x) !== null) {
					throw new Error(`Cell at (${x}, ${y}) is already occupied`);
				}

				const piece = this.turn % 2 === 0 ? TicTacToe.PIECES.X : TicTacToe.PIECES.O;
				this.board.set(y, x, piece);

				const result = this.checkWin();
				if (result.gameover) {
					this.destroy(); // End the game
					return result as GameOverResponse;
				} else {
					this.nextTurn(); // Move to the next player
					return {
						winner: null,
						gameover: false,
						next_turn: this.getPlayerByTurn(),
						display: {
							global: this.display()
						},
						available_actions: this.availableActions(this.getPlayerByTurn())
					};
				}
			}
			default:
				throw new Error(`Unknown action: ${action}`);
		}
	}
}
import {Request, Response} from 'express';

export type JSONPrimitives = string | number | boolean | null | undefined;
export type JSONValue = JSONPrimitives | JSONValue[] | { [key: string]: JSONValue };

export type NumberParam = {
	type: 'number';
	min: number;
	max: number;
	required: boolean;
}

export type StringParam = {
	type: 'string';
	required: boolean;
}

export type BooleanParam = {
	type: 'boolean';
	required: boolean;
}

export type Action = {
	id: string;
	name: string;
	params: Record<string, NumberParam | StringParam | BooleanParam>;
}

export type BoardDisplay = {
	type: 'board';
	pieces: Record<number, string>; // mapping of piece IDs to their names
	board: Array<Array<number | null>>; // 2D array representing the board, null for empty cells
}

export type HandDisplay = {
	type: 'hand';
	cards: Array<{
		id: string; // unique identifier for the card
		name: string; // name of the card
	}>;
}

export type Display = BoardDisplay | HandDisplay;

export type GameOverResponse = {
	winner: string | null; // user_id of the winner, or null if no winner
	gameover: true; // true if the game is over, false otherwise
}

export type GameMovementResponse = {
	winner: null;
	gameover: false; // if game is ended, use GameOverResponse type
	display: Record<string, Display> & { global?: Display };
	next_turn: string; // user_id of the next player to take a turn
	available_actions: Array<Action>; // actions available for the next player
}

export interface IEndpoint {
	method: 'GET' | 'POST';
	route: string;
	params?: Record<string, string>;
	queries?: string[];
	handler: (req?: Request, res?: Response) => Promise<{
		status?: number;
		[key: string]: JSONValue
	}>;
}

export interface IGameInstance {
	lobby_id: string; // XXX-XXX-XXX
	players: string[]; // user_id[]
	turn: number; // index of the current player in this.players
	getPlayerByTurn(turn?: number): string;
	nextTurn(): string;
	prevTurn(): string;
	removePlayer(user_id: string): void;
	playerCanMove(user_id: string): boolean;
	destroy(): void;
	display(userID?: string): JSONValue;
	availableActions(user_id: string): Array<Action>;
	move(user_id: string, action_id: string, params: Record<string, JSONValue>): Promise<GameMovementResponse | GameOverResponse>
	getInitialState(): Record<string, Display> & { global?: Display };
}

export interface IGameClass {
	name: string;
	description: string;
	players: { min: number; max: number };
	ACTIONS: Record<string, Action>;
	new (lobby_id: string, players: string[]): IGameInstance;
}
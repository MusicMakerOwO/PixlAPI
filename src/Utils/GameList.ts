import fs from 'node:fs';
import {GAMES_FOLDER} from '../Constants.js';
import {Log} from './Log.js';

const GAMES = new Map(); // string -> { name, description, players: { min, max } }

const gameFiles = fs.readdirSync(GAMES_FOLDER).filter((file: string) => file.endsWith('.js'));

for (const file of gameFiles) {
	const gamePath = `${GAMES_FOLDER}/${file}`;
	try {
		let game = require(gamePath) as { name: string, description: string, players: { min: number, max: number } } | { default: { name: string, description: string, players: { min: number, max: number } } };
		if ('default' in game) {
			// If the module exports a default, use that
			game = game.default;
		}
		GAMES.set(game.name, {
			name: game.name,
			description: game.description,
			players: game.players
		});
	} catch (error) {
		// @ts-ignore
		Log('ERROR', `Failed to load game from file "${file}": ${error.message}`);
	}
}

export default GAMES;
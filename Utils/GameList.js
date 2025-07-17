const fs = require('fs');
const path = require('path');
const { GAMES_FOLDER, ROOT_FOLDER } = require('../Constants.js');
const FileWatcher = require('./FileWatcher.js');
const { Log } = require('./Log.js');
const Debounce = require('./Debounce.js');

const GAMES = new Map(); // string -> { name, description, players: { min, max } }

const Watcher = new FileWatcher(GAMES_FOLDER, true);
Watcher.onChange = Debounce((filePath) => {
	if (filePath.endsWith('~')) return; // Ignore temporary files
	Log('DEBUG', `Reloading game file: ${filePath.replace(ROOT_FOLDER, '')}`);
	delete require.cache[ filePath ];
	const game = require(filePath);
	GAMES.set(game.name, {
		name: game.name,
		description: game.description,
		players: game.players
	});
}, 1000);
Watcher.onAdd = Debounce((filePath, type) => {
	if (type !== FileWatcher.FILE_TYPE.FILE) return;
	if (filePath.endsWith('~')) return; // Ignore temporary files
	Log('DEBUG', `Adding game file: ${filePath.replace(ROOT_FOLDER, '')}`);
	delete require.cache[ path.resolve(filePath) ];
	const game = require(filePath);
	GAMES.set(game.name, {
		name: game.name,
		description: game.description,
		players: game.players
	});
}, 1000);
Watcher.onRemove = Debounce((path) => {
	if (path.endsWith('~')) return; // Ignore temporary files
	Log('DEBUG', `Removing game file: ${path.replace(ROOT_FOLDER, '')}`);
	const gameName = path.split('/').pop().replace('.js', '');
	GAMES.delete(gameName);
}, 1000);

const gameFiles = fs.readdirSync(GAMES_FOLDER).filter(file => file.endsWith('.js'));
gameFiles.forEach(file => {
	const gamePath = `${GAMES_FOLDER}/${file}`;
	const game = require(gamePath);
	GAMES.set(game.name, {
		name: game.name,
		description: game.description,
		players: game.players
	});
});

module.exports = GAMES;

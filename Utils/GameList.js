const fs = require('fs');
const path = require('path');
const { GAMES_FOLDER } = require('../Constants.js');
const FileWatcher = require('./FileWatcher.js');

const GAMES = new Map(); // string -> { name, description, players: { min, max } }

const Watcher = new FileWatcher(GAMES_FOLDER, true);
Watcher.onChange = (filePath) => {
	console.log(`Game file changed: ${filePath}`);
	delete require.cache[ filePath ];
	const game = require(filePath);
	GAMES.set(game.name, {
		name: game.name,
		description: game.description,
		players: game.players
	});
}
Watcher.onAdd = (filePath, type) => {
	if (type !== FileWatcher.FILE_TYPE.FILE) return;
	console.log(`Game file added: ${filePath}`);
	delete require.cache[ path.resolve(filePath) ];
	const game = require(filePath);
	GAMES.set(game.name, {
		name: game.name,
		description: game.description,
		players: game.players
	});
};
Watcher.onRemove = (path) => {
	console.log(`Game file removed: ${path}`);
	const gameName = path.split('/').pop().replace('.js', '');
	GAMES.delete(gameName);
};

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

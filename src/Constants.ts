const ROOT_FOLDER = __dirname;

const DB_SETUP_FILE = `${ROOT_FOLDER}/../DB_SETUP.sql`;
const DB_FILE = `${ROOT_FOLDER}/../api.sqlite`;
const GAMES_FOLDER = `${ROOT_FOLDER}/Games`;

const ROUTES_FOLDER = `${ROOT_FOLDER}/Routes`;

const AVAILABLE_METHODS = new Set(['GET', 'POST']);
const PRIMITIVE_TYPES = new Set(['string', 'number', 'boolean', 'array']);

const SECONDS = {
	MINUTE: 60,
	HOUR: 	60 * 60,
	DAY: 	60 * 60 * 24,
	WEEK: 	60 * 60 * 24 * 7,
	MONTH: 	60 * 60 * 24 * 30,
	YEAR: 	60 * 60 * 24 * 365
}

const CORES_AVAILABLE = require('os').cpus().length;

const GAME_STATE = {
	IN_PROGRESS: 0,
	COMPLETED: 1,
	FORFEITED: -1
}

const ACTIVE_GAMES = new Map(); // lobby_id -> Game instance

export {
	ROOT_FOLDER,

	DB_SETUP_FILE,
	DB_FILE,
	GAMES_FOLDER,

	ROUTES_FOLDER,

	AVAILABLE_METHODS,
	PRIMITIVE_TYPES,

	SECONDS,

	CORES_AVAILABLE,

	GAME_STATE,
	ACTIVE_GAMES
}
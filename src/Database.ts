// const fs = require('node:fs');
// const BetterSqlite3 = require('better-sqlite3');
// const { DB_SETUP_FILE, DB_FILE, ROOT_FOLDER } = require('./Constants.js');
import fs from 'node:fs';
import BetterSqlite3 from 'better-sqlite3';
import {DB_FILE, DB_SETUP_FILE, ROOT_FOLDER} from './Constants.js';

function ParseQueries(fileContent: string): string[] {
	const queries = [];
	let buffer = '';
	let inMultilineComment = false;
	let inSubQuery = false;

	const lines = fileContent.split('\n');
	for (let i = 0; i < lines.length; i++) {
		let line = lines[i].trim();

		if (line.startsWith('--')) continue;

		if (line.startsWith('/*')) {
			inMultilineComment = true;
		}

		if (inMultilineComment) {
			if (line.endsWith('*/')) {
				inMultilineComment = false;
			}
			continue;
		}

		if (line.includes('BEGIN')) {
			inSubQuery = true;
		}

		if (line.includes('END')) {
			inSubQuery = false;
		}

		buffer += line + '\n';

		if (line.endsWith(';') && !inSubQuery) {
			queries.push(buffer.trim());
			buffer = '';
		} else {
			buffer += ' ';
		}
	}

	// Check if there's any remaining content in the buffer (for cases where the file might not end with a semicolon)
	if (buffer.trim()) {
		queries.push(buffer.trim());
	}

	return queries;
}

const FileContent = fs.readFileSync(DB_SETUP_FILE, 'utf8');

const NoComments = FileContent.replace(/--.*\n/g, '');

const MACROS : Record<string, string> = {
	ROOT_FOLDER: ROOT_FOLDER,
	ISO_TIMESTAMP: "strftime('%Y-%m-%dT%H:%M:%SZ', 'now')"
};

const WithMacros = NoComments.replace(/{{(.*?)}}/g, (match, macro) => {
	if (MACROS[macro]) return MACROS[macro];
	console.error(`Unknown macro: ${macro}`);
	return match;
});

const DBQueries = ParseQueries(WithMacros);

// @ts-ignore
interface SQLDatabase extends BetterSqlite3.Database {
	tables: Set<string>;
	prepare<result>(query: string, force?: boolean): BetterSqlite3.Statement<unknown[], result>;
}

// @ts-ignore
const Database: SQLDatabase = new BetterSqlite3(DB_FILE);

Database.pragma('foreign_keys = ON');
Database.pragma('journal_mode = WAL');
Database.pragma('cache_size = 50000');  // ~200MB cache
Database.pragma('temp_store = MEMORY'); // Use memory for temporary tables
Database.pragma('mmap_size = 268435456'); // 256MB memory map

for (let i = 0; i < DBQueries.length; i++) {
	try {
		Database.exec( DBQueries[i] );
	} catch (error) {
		console.error( DBQueries[i] );
		console.error(error);
		process.exit(1);
	}
}

Database.tables = new Set( Database.prepare<string>("SELECT name FROM sqlite_master WHERE type='table'").pluck().all() );

const queryCache = new Map(); // query -> prepared_statement

const originalPrepare = Database.prepare.bind(Database);
Database.prepare = function<result>(query: string, force = false) {
	if (!force && queryCache.has(query)) return queryCache.get(query);

	const preparedStatement: BetterSqlite3.Statement<unknown[], result> = originalPrepare(query);
	if (!force) queryCache.set(query, preparedStatement);

	return preparedStatement;
}

export default Database;
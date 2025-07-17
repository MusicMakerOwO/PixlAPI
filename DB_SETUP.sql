-- noinspection SqlWithoutWhereForFile

-- NodeJS can only make timers so long
-- For long-running tasks like channel purging we need a more permanent solution
-- This will keep the run time data even on restart
CREATE TABLE IF NOT EXISTS Timers (
	id TEXT NOT NULL PRIMARY KEY,
	last_run INTEGER NOT NULL DEFAULT ( UNIXEPOCH('now', 'localtime') )
) STRICT;

CREATE TABLE IF NOT EXISTS Users (
	user_id TEXT NOT NULL PRIMARY KEY, -- Discord user ID
	username TEXT NOT NULL,
	token TEXT NOT NULL UNIQUE
) STRICT;

CREATE TABLE IF NOT EXISTS GameLobbies (
	id TEXT NOT NULL PRIMARY KEY,

	owner_id TEXT, -- NULL at creation, set to user_id directly after
	game TEXT NOT NULL,
	max_players INTEGER NOT NULL,

	-- Private lobbies are not listed in the lobby list
	-- You must have the exact code to join
	private INTEGER NOT NULL DEFAULT 0,

	in_progress INTEGER NOT NULL DEFAULT 0, -- cannot join lobbies after game starts
	allow_spectators INTEGER NOT NULL DEFAULT 0, -- allow spectators to join after game starts

	FOREIGN KEY (owner_id) REFERENCES Users(user_id)
) STRICT;

CREATE TABLE IF NOT EXISTS Players (
	lobby_id TEXT NOT NULL,
	user_id TEXT NOT NULL UNIQUE, -- players can only be in one lobby at a time

	PRIMARY KEY (lobby_id, user_id),
	FOREIGN KEY (lobby_id) REFERENCES GameLobbies(id) ON DELETE CASCADE,
	FOREIGN KEY (user_id) REFERENCES Users(user_id) ON DELETE CASCADE
) STRICT;

-- Clear tables on startup
DELETE FROM GameLobbies;
DELETE FROM Players;

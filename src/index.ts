import * as sqlite3 from "better-sqlite3";
import * as crypto from "crypto";

let db: sqlite3.Database | null = null;
let dbStatement: sqlite3.Statement<Buffer> | null = null;

export function connect(path: string) {

	disconnect();

	db = new sqlite3(path, {
		fileMustExist: true,
		readonly     : true,
	});

	db.pragma("foreign_keys = false");
	db.pragma("journal_mode = off");
	db.pragma("synchronous = off");
	db.pragma("locking_mode = exclusive");
	db.pragma("secure_delete = false");
	db.pragma("automatic_index = false");
	db.pragma("page_size = 512");

	dbStatement = db.prepare("SELECT COUNT(hash) AS c FROM pwned where hash = ?");
}

export function disconnect() {
	if (db) {
		db.close();
		db = null;
	}
	if (dbStatement) {
		dbStatement = null;
	}
}

export function pwned(value: string) {
	if (!db || !dbStatement) {
		throw Error("First connect to the pwned database.");
	}

	return dbStatement.get(
		crypto
			.createHash("sha1")
			.update(value)
			.digest()
	).c === 1;
}

export default {
	connect,
	disconnect,
	pwned,
};

import Database from "better-sqlite3";
import * as sqlite_vss from "sqlite-vss";

// Initialise SQLite database
const db = new Database("data/atlas.db");

// Load sqlite-vss extension into the database
sqlite_vss.load(db);

export default db;

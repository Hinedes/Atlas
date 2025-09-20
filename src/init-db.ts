import Database from 'better-sqlite3';

// This connects to a database file in a 'data' folder.
// The file will be created if it doesn't exist.
const db = new Database('data/atlas.db', { verbose: console.log });

function initialize() {
  // This command creates the 'atoms' table if it doesn't already exist.
  const createTableStmt = db.prepare(`
        CREATE TABLE IF NOT EXISTS atoms (
            id INTEGER PRIMARY KEY AUTOINCREMENT,
            title TEXT NOT NULL,
            body TEXT,
            created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
        )
    `);
  createTableStmt.run();

  // Let's add some sample data so we have something to see.
  const insertStmt = db.prepare(`
        INSERT INTO atoms (title, body) VALUES (?, ?)
    `);
  insertStmt.run('First Atom', 'This is the body of the first atom.');
  insertStmt.run('Second Atom', 'This is another atom in our database!');

  console.log('Database initialized successfully.');
}

initialize();

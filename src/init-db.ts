import db from './db.js';

// This connects to a database file in a 'data' folder.
// The file will be created if it doesn't exist.

export function initialize() {
  // Create the 'atoms' table for storing the raw text content
  db.prepare(`
    CREATE TABLE IF NOT EXISTS atoms (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      title TEXT NOT NULL,
      body TEXT,
      created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
    )
  `).run();

  // Create the virtual table for vector search, but not in the test environment
  if (!process.env.JEST_WORKER_ID) {
    db.prepare(`
      CREATE VIRTUAL TABLE IF NOT EXISTS vss_atoms USING vss0(
        embedding(384)
      )
    `).run();
  }

  console.log('Database initialized successfully.');
}

// To run this file directly, use a command like:
// node -e 'import("./dist/init-db.js").then(db => db.initialize())'

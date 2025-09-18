import express from 'express';
import Database from 'better-sqlite3';

const app = express();
const port = 3000;

// Connect to the database
const db = new Database('data/atlas.db');

// The root route still works
app.get('/', (req, res) => {
  res.json({ message: "Welcome to the Atlas API! It is alive." });
});

// NEW: An endpoint to get all atoms from the database
app.get('/atoms', (req, res) => {
    try {
        const stmt = db.prepare('SELECT * FROM atoms');
        const atoms = stmt.all();
        res.json(atoms);
    } catch (error) {
        res.status(500).json({ error: 'Failed to retrieve atoms' });
    }
});

app.listen(port, () => {
  console.log(`Atlas server is running at http://localhost:${port}`);
});
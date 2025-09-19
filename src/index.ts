import express from 'express';
import db from './db.js';

const app = express();
const port = 3000;

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

// An endpoint to get a single atom by its ID
app.get('/atoms/:id', (req, res) => {
    try {
        const id = parseInt(req.params.id, 10);
        if (isNaN(id)) {
            return res.status(400).json({ error: 'Invalid ID format' });
        }

        const stmt = db.prepare('SELECT * FROM atoms WHERE id = ?');
        const atom = stmt.get(id);

        if (atom) {
            res.json(atom);
        } else {
            res.status(404).json({ error: `Atom with id ${id} not found` });
        }
    } catch (error) {
        res.status(500).json({ error: 'Failed to retrieve atom' });
    }
});

app.listen(port, () => {
  console.log(`Atlas server is running at http://localhost:${port}`);
});
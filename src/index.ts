import express from 'express';
import db from './db.js';
import { EmbeddingPipeline } from './embedding.js';
import dotenv from 'dotenv';

dotenv.config();

const app = express();
const port = 3000;
// --- NEW: This line serves your index.html page ---
app.use(express.static('public'));

// The root route is now handled by the line above, but we can keep this for API checks.
app.get('/api/status', (_req, res) => {
  res.json({ message: 'Welcome to the Atlas API! It is alive.' });
});

// Endpoint to get all atoms (without the embedding for performance)
app.get('/atoms', (_req, res) => {
  try {
    const stmt = db.prepare('SELECT id, title, body, created_at FROM atoms');
    const atoms = stmt.all();
    res.json(atoms);
  } catch (_error) {
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
  } catch (_error) {
    res.status(500).json({ error: 'Failed to retrieve atom' });
  }
});

// The Semantic Search Endpoint
app.get('/search', async (req, res) => {
    const query = req.query.q as string;
    if (!query) {
        return res.status(400).json({ error: 'Query parameter "q" is required.' });
    }

    try {
        console.log(`Searching for: "${query}"`);
        const extractor = await EmbeddingPipeline.getInstance();
        const queryEmbedding = await extractor(query, { pooling: 'mean', normalize: true });
        
        const stmt = db.prepare(`
            SELECT a.id, a.title, a.body, v.distance
            FROM vss_atoms v
            JOIN atoms a ON v.rowid = a.id
            WHERE vss_search(v.embedding, json(?))
            ORDER BY v.distance
            LIMIT 5
        `);

        const results = stmt.all(JSON.stringify(Array.from(queryEmbedding.data)));
        console.log(`Found ${results.length} results.`);
        res.json(results);

    } catch (error) {
        console.error(error);
        res.status(500).json({ error: 'Search failed.' });
    }
});

app.listen(port, () => {
  console.log(`Atlas server is running at http://localhost:${port}`);
});
import express from 'express';
import db from './db.js';
import { pipeline, FeatureExtractionPipeline } from '@xenova/transformers';
import { Database } from "sqlite-vss";

// Helper class for the embedding model
class EmbeddingPipeline {
    static task = 'feature-extraction';
    static model = 'Xenova/all-MiniLM-L6-v2';
    static instance: FeatureExtractionPipeline | null = null;

    static async getInstance() {
        if (this.instance === null) {
            this.instance = await pipeline(this.task, this.model) as FeatureExtractionPipeline;
        }
        return this.instance;
    }
}

const app = express();
const port = 3000;
const vss = new VssDatabase(db);

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
        
        const results = await vss.search('atoms', 'embedding', queryEmbedding.data, 5);
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
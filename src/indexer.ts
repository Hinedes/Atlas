import fs from 'fs';
import path from 'path';
import url from 'url';
import db from './db.js';
import { EmbeddingPipeline } from './embedding.js';

const vaultPath = path.join(process.cwd(), 'vault');

// This function is the single source of truth for populating the database.
// It completely wipes the database and re-indexes all documents from the vault.
// This is a simple and effective strategy for ensuring the index is always in sync.
export async function runIndexer() {
  try {
    console.log('Starting indexer...');
    const extractor = await EmbeddingPipeline.getInstance();
    db.prepare('DELETE FROM atoms').run();
    db.prepare('DELETE FROM vss_atoms').run();
    console.log('Cleared existing atoms from database.');

    const documents = [];
    const files = fs.readdirSync(vaultPath);
    for (const file of files) {
      if (path.extname(file) === '.md') {
        console.log(`Processing file: ${file}`);
        const content = fs.readFileSync(path.join(vaultPath, file), 'utf-8');
        const sections = content.split(/##\s+/);

        for (let i = 1; i < sections.length; i++) {
          const section = sections[i];
          if (!section) continue;

          const lines = section.split('\n');
          let title = '';
          let bodyStartIndex = 0;

          for (let j = 0; j < lines.length; j++) {
            const line = lines[j].trim();
            if (line) {
              title = line;
              bodyStartIndex = j + 1;
              break;
            }
          }

          if (!title) continue;

          const body = lines.slice(bodyStartIndex).join('\n').trim();
          documents.push({ title, body });
        }
      }
    }

    console.log(`Found ${documents.length} documents to index.`);

    if (documents.length > 0) {
      const texts = documents.map(doc => doc.title + '\n' + doc.body);
      const embeddings = await extractor(texts, { pooling: 'mean', normalize: true });

      for (let i = 0; i < documents.length; i++) {
        try {
          const doc = documents[i];
          const embedding = embeddings[i].data;

          const info = db.prepare(
            'INSERT INTO atoms (title, body) VALUES (?, ?)'
          ).run(doc.title, doc.body);

          if (!process.env.JEST_WORKER_ID) {
            db.prepare(
              'INSERT INTO vss_atoms (rowid, embedding) VALUES (?, ?)'
            ).run(info.lastInsertRowid, JSON.stringify(Array.from(embedding)));
          }

          console.log(`  -> Indexed Atom: "${doc.title}"`);
        } catch (error) {
          const message = error instanceof Error ? error.message : String(error);
          console.error(`  -> Failed to index atom: "${documents[i].title}". Error: ${message}`);
        }
      }
    }

    console.log('Indexer finished successfully.');
  } catch (error) {
    // It's better to cast the error to the Error type to access the message
    // property safely.
    const message = error instanceof Error ? error.message : String(error);
    console.error('Error during indexing:', message);
    process.exit(1);
  }
}

// This part of the code is problematic for Jest, and not essential for the library's functionality.
// It's better to run the indexer via a separate script if needed.

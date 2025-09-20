import fs from 'fs';
import path from 'path';
import url from 'url';
import db from './db.js';

// The modern way to get the directory path
const __dirname = path.dirname(url.fileURLToPath(import.meta.url));
const vaultPath = path.join(__dirname, '..', 'vault');

// ... The rest of the runIndexer() function remains the same ...
export function runIndexer() {
  try {
    console.log('Starting indexer...');
    db.prepare('DELETE FROM atoms').run();
    console.log('Cleared existing atoms from database.');

    const files = fs.readdirSync(vaultPath);
    for (const file of files) {
      if (path.extname(file) === '.md') {
        console.log(`Processing file: ${file}`);
        const content = fs.readFileSync(path.join(vaultPath, file), 'utf-8');
        const sections = content.split('## ');

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
          const insertStmt = db.prepare(
            'INSERT INTO atoms (title, body) VALUES (?, ?)'
          );
          insertStmt.run(title, body);
          console.log(`  -> Indexed Atom: "${title}"`);
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

// If this file is run directly, execute the indexer.
if (import.meta.url.startsWith('file://') && process.argv[1] === url.fileURLToPath(import.meta.url)) {
  runIndexer();
}

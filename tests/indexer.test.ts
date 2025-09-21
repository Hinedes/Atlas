import fs from 'fs';
import path from 'path';
import db from '../src/db.js';
import { runIndexer } from '../src/indexer.js';
import { Atom } from '../src/types.js';

const vaultPath = path.join(__dirname, '..', 'vault');

describe('Indexer', () => {
  beforeEach(() => {
    // Clear the database and the vault before each test
    db.prepare('DELETE FROM atoms').run();
    const files = fs.readdirSync(vaultPath);
    for (const file of files) {
      fs.unlinkSync(path.join(vaultPath, file));
    }
  });

  it('should not index a section with a blank line between title and body', () => {
    // Create a markdown file with a blank line after the title
    const noteContent = `
##

My Test Title

This is the body of the test note.
`;
    fs.writeFileSync(path.join(vaultPath, 'test-note.md'), noteContent);

    // Run the indexer
    runIndexer();

    // Check the database
    const stmt = db.prepare('SELECT * FROM atoms WHERE title = ?');
    const atom = stmt.get('My Test Title') as Atom;

    // This should fail before the fix
    expect(atom).toBeUndefined();
  });
});

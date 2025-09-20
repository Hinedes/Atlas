import fs from 'fs';
import path from 'path';
import db from '../src/db';
import { runIndexer } from '../src/indexer';
import assert from 'assert';

const vaultPath = path.join(__dirname, '..', 'vault');

async function runTest() {
  try {
    // Clean up from previous runs
    db.prepare('DELETE FROM atoms').run();
    const files = fs.readdirSync(vaultPath);
    for (const file of files) {
      // Keep sample-note.md
      if(file !== 'sample-note.md') {
        fs.unlinkSync(path.join(vaultPath, file));
      }
    }

    // Create the problematic markdown file
    const noteContent = `
##

My Test Title

This is the body of the test note.
`;
    fs.writeFileSync(path.join(vaultPath, 'test-note.md'), noteContent);

    // Run the indexer
    await runIndexer();

    // Check the database
    const stmt = db.prepare('SELECT * FROM atoms WHERE title = ?');
    const atom = stmt.get('My Test Title');

    // Assert that the atom was created
    assert.notStrictEqual(atom, undefined, 'The atom should have been created, but it was not.');
    assert.strictEqual(atom.title, 'My Test Title', 'The atom title is incorrect.');

    console.log('Test passed: The fix is confirmed.');
    process.exit(0);
  } catch (error) {
    console.error('Test failed:', error);
    process.exit(1);
  }
}

runTest();

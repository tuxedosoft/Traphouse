const Database = require('better-sqlite3');
const path = require('path');

const dbPath = path.join(process.cwd(), 'microblog.db');
const db = new Database(dbPath);

const insert = db.prepare('INSERT INTO posts (id, content, timestamp) VALUES (?, ?, ?)');

for (let i = 0; i < 15; i++) {
  const id = Date.now().toString() + i;
  const content = `This is test post number ${i + 1}.`;
  const timestamp = new Date().toISOString();
  insert.run(id, content, timestamp);
}

console.log('15 test posts added.');
db.close();
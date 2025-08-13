import Database from 'better-sqlite3';
import path from 'path';

const dbPath = path.join(process.cwd(), 'microblog.db');
const db = new Database(dbPath);

db.exec(`
  CREATE TABLE IF NOT EXISTS posts (
    id TEXT PRIMARY KEY,
    content TEXT NOT NULL,
    timestamp TEXT NOT NULL
  );

  CREATE TABLE IF NOT EXISTS users (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    username TEXT UNIQUE NOT NULL,
    password TEXT NOT NULL
  );

  CREATE TABLE IF NOT EXISTS settings (
    key TEXT PRIMARY KEY,
    value TEXT
  );
`);

// Seed a default admin user if not exists
import bcrypt from 'bcrypt';

// Seed a default admin user if not exists
const adminUser = db.prepare('SELECT * FROM users WHERE username = ?').get('admin');
if (!adminUser) {
  const hashedPassword = bcrypt.hashSync('password', 10); // Hash the password
  db.prepare('INSERT INTO users (username, password) VALUES (?, ?)').run('admin', hashedPassword);
}

// Seed default site name if not exists
const siteNameSetting = db.prepare('SELECT * FROM settings WHERE key = ?').get('site_name');
if (!siteNameSetting) {
  db.prepare('INSERT INTO settings (key, value) VALUES (?, ?)').run('site_name', 'Microblog');
}

// Seed default site tagline if not exists
const siteTaglineSetting = db.prepare('SELECT * FROM settings WHERE key = ?').get('site_tagline');
if (!siteTaglineSetting) {
  db.prepare('INSERT INTO settings (key, value) VALUES (?, ?)').run('site_tagline', 'Share your thoughts with the world');
}

// Seed default privacy setting if not exists
const privacySetting = db.prepare('SELECT * FROM settings WHERE key = ?').get('posts_public');
if (!privacySetting) {
  db.prepare('INSERT OR REPLACE INTO settings (key, value) VALUES (?, ?)').run('posts_public', 'true');
}

export default db;
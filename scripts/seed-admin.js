const Database = require('better-sqlite3');
const path = require('path');
const bcrypt = require('bcrypt');

const dbPath = path.join(process.cwd(), 'microblog.db');
const db = new Database(dbPath);

// Create tables if they don't exist
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

// Check if admin user already exists
const adminUser = db.prepare('SELECT * FROM users WHERE username = ?').get('admin');

if (!adminUser) {
  // Create admin user with hashed password
  const hashedPassword = bcrypt.hashSync('admin123', 10);
  db.prepare('INSERT INTO users (username, password) VALUES (?, ?)').run('admin', hashedPassword);
  console.log('Admin user created successfully!');
  console.log('Username: admin');
  console.log('Password: admin123');
} else {
  console.log('Admin user already exists.');
}

// Seed default site name if not exists
const siteNameSetting = db.prepare('SELECT * FROM settings WHERE key = ?').get('site_name');
if (!siteNameSetting) {
  db.prepare('INSERT INTO settings (key, value) VALUES (?, ?)').run('site_name', 'Microblog');
  console.log('Default site name set to "Microblog"');
}

db.close();
console.log('Database seeding completed.'); 
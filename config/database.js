const sqlite3 = require('sqlite3').verbose();
const path = require('path');

// A3: Injection - Setting up database without proper security
const db = new sqlite3.Database(path.join(__dirname, '../vulndb.sqlite'));

// Initialize database
db.serialize(() => {
  // Create users table
  db.run(`CREATE TABLE IF NOT EXISTS users (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    username TEXT UNIQUE,
    password TEXT,
    email TEXT,
    role TEXT DEFAULT 'user'
  )`);

  // Create products table
  db.run(`CREATE TABLE IF NOT EXISTS products (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    name TEXT,
    description TEXT,
    price REAL,
    image TEXT
  )`);

  // Create dummy admin user with weak password
  db.run(`INSERT OR IGNORE INTO users (username, password, email, role) 
          VALUES ('admin', 'admin123', 'admin@example.com', 'admin')`);

  // Insert some dummy products
  db.run(`INSERT OR IGNORE INTO products (name, description, price, image)
          VALUES ('Flag 1', 'This product contains a flag!', 100, 'flag1.jpg')`);
});

// A3: Injection - Vulnerable query function (SQL Injection)
function query(sql, params, callback) {
  // Deliberately vulnerable concatenation
  if (params) {
    Object.keys(params).forEach(key => {
      sql = sql.replace(`:${key}`, params[key]);
    });
  }
  // Directly executes concatenated SQL (vulnerable to SQL injection)
  return db.all(sql, callback);
}

module.exports = { db, query };

const fs = require('fs');
const path = require('path');
const initSqlJs = require('sql.js');

let db;
let SQL;

// A3: Injection - Setting up database without proper security
async function initDatabase() {
  try {
    // Initialize SQL.js
    SQL = await initSqlJs();
    
    const dbPath = path.join(__dirname, '../vulndb.sqlite');
    let buffer;
    
    // Check if database file exists
    if (fs.existsSync(dbPath)) {
      buffer = fs.readFileSync(dbPath);
      db = new SQL.Database(buffer);
    } else {
      // Create new database
      db = new SQL.Database();
      
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

      // Create flags table (hidden table with flags)
      db.run(`CREATE TABLE IF NOT EXISTS hidden_flags (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        flag_name TEXT,
        flag_value TEXT
      )`);
    
      // Create dummy admin user with weak password
      db.run(`INSERT OR IGNORE INTO users (username, password, email, role) 
              VALUES ('admin', 'admin123', 'admin@example.com', 'admin')`);
      
      // Create user with flag in password
      db.run(`INSERT OR IGNORE INTO users (username, password, email, role) 
              VALUES ('flag_user', 'CTF{sql_injection_reveals_passwords}', 'flag@example.com', 'user')`);
    
      // Insert some dummy products
      db.run(`INSERT OR IGNORE INTO products (name, description, price, image)
              VALUES ('Flag 1', 'This product contains a flag!', 100, 'flag1.png')`);
              
      db.run(`INSERT OR IGNORE INTO products (name, description, price, image)
              VALUES ('Secret Flag', 'CTF{blind_sql_injection_flag}', 1337, 'secret.png')`);
              
      db.run(`INSERT OR IGNORE INTO products (name, description, price, image)
              VALUES ('Admin Product', '<script>alert("CTF{stored_xss_in_product}")</script>', 500, 'admin.png')`);

      // Insert hidden flags
      db.run(`INSERT OR IGNORE INTO hidden_flags (flag_name, flag_value) 
              VALUES ('database_flag', 'CTF{hidden_database_table_flag}')`);
      
      // Save the database to disk
      const data = db.export();
      fs.writeFileSync(dbPath, Buffer.from(data));
    }
    
    console.log('Database initialized successfully');
  } catch (err) {
    console.error('Database initialization error:', err);
  }
}

// A3: Injection - Vulnerable query function (SQL Injection)
function query(sql, params, callback) {
  if (!db) {
    return callback(new Error('Database not initialized'), null);
  }
  
  try {
    // Deliberately vulnerable concatenation
    if (params) {
      Object.keys(params).forEach(key => {
        sql = sql.replace(`:${key}`, params[key]);
      });
    }
    
    // Execute the SQL and get results
    const results = [];
    const stmt = db.prepare(sql);
    
    while (stmt.step()) {
      results.push(stmt.getAsObject());
    }
    
    stmt.free();
    callback(null, results);
    
    // Save any changes to disk
    const data = db.export();
    fs.writeFileSync(path.join(__dirname, '../vulndb.sqlite'), Buffer.from(data));
    
  } catch (err) {
    // Easter egg in error message
    if (err.message && err.message.includes('syntax')) {
      err.message += " (Hint: CTF{sql_error_based_injection})";
    }
    callback(err, null);
  }
}

// Initialize database when module is loaded
initDatabase().catch(console.error);

module.exports = { query, initDatabase };

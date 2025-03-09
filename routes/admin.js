const express = require('express');
const router = express.Router();
const { query } = require('../config/database');
const path = require('path');

// A1: Broken Access Control - No proper role check
router.get('/', (req, res) => {
  // Missing proper authorization check, relying on client-side protection
  res.sendFile(path.join(__dirname, '../views', 'admin.html'));
});

// A1: Broken Access Control - Insecure direct object reference
router.get('/user/:id', (req, res) => {
  const userId = req.params.id;
  // No authorization check before accessing user data
  query(`SELECT * FROM users WHERE id = ${userId}`, null, (err, rows) => {
    if (err) {
      return res.status(500).json({ error: err.message });
    }
    if (rows.length > 0) {
      // Add a special flag if user accesses admin user data
      const userData = rows[0];
      if (userData.role === 'admin') {
        userData.secretNote = 'CTF{insecure_direct_object_reference}';
      }
      res.json(userData);
    } else {
      res.status(404).json({ error: 'User not found' });
    }
  });
});

// A1: Broken Access Control - Insecure function level authorization
router.post('/set-admin', (req, res) => {
  const { userId } = req.body;
  
  // No verification if the requesting user has admin privileges
  query(`UPDATE users SET role = 'admin' WHERE id = ${userId}`, null, (err) => {
    if (err) {
      return res.status(500).json({ error: err.message });
    }
    res.json({ 
      success: true, 
      message: 'User role updated to admin',
      flag: 'CTF{privilege_escalation_vulnerability}'
    });
  });
});

// A9: Security Logging and Monitoring Failures - No logging of admin actions
router.post('/delete-user', (req, res) => {
  const { userId } = req.body;
  
  // Deleting user without logging who performed this action
  query(`DELETE FROM users WHERE id = ${userId}`, null, (err) => {
    if (err) {
      return res.status(500).json({ error: err.message });
    }
    res.json({ 
      success: true, 
      message: 'User deleted',
      debugNote: 'No audit log created (CTF{missing_audit_logs})'
    });
  });
});

// Hidden admin page with flag
router.get('/secret', (req, res) => {
  res.send(`
    <html>
      <head><title>Secret Admin Page</title></head>
      <body>
        <h1>Super Secret Admin Area</h1>
        <p>Congratulations on finding this hidden page!</p>
        <p>Your flag is: CTF{hidden_admin_functionality}</p>
      </body>
    </html>
  `);
});

// Admin backup interface with directory traversal
router.get('/backup', (req, res) => {
  const backupFile = req.query.file || 'users.bak';
  
  // Directory traversal vulnerability
  const filePath = path.join(__dirname, '../backups', backupFile);
  
  // This is vulnerable, but we'll return a flag for demonstration purposes
  if (backupFile.includes('../')) {
    return res.send(`
      <h1>Directory Traversal Detected!</h1>
      <p>But here's your flag: CTF{directory_traversal_vulnerability}</p>
    `);
  }
  
  res.send(`<h1>Backup requested: ${backupFile}</h1><p>Try to use path traversal to get files outside the backup directory.</p>`);
});

module.exports = router;

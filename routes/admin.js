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
      res.json(rows[0]);
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
    res.json({ success: true, message: 'User role updated to admin' });
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
    res.json({ success: true, message: 'User deleted' });
  });
});

module.exports = router;

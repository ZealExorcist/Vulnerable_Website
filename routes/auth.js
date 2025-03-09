const express = require('express');
const router = express.Router();
const { query } = require('../config/database');
const config = require('../config/config');

// A7: Identification and Authentication Failures
router.post('/login', (req, res) => {
  const { username, password } = req.body;
  
  // A3: Injection - SQL injection vulnerability
  query(`SELECT * FROM users WHERE username = '${username}' AND password = '${password}'`, 
    null, 
    (err, rows) => {
      if (err) {
        return res.status(500).json({ error: err.message });
      }
      
      if (rows.length > 0) {
        // A7: Identification and Authentication Failures - Weak session management
        req.session.user = rows[0];
        res.redirect('/profile');
      } else {
        res.redirect('/login?error=Invalid credentials');
      }
    }
  );
});

// A7: Identification and Authentication Failures - Weak registration
router.post('/register', (req, res) => {
  const { username, password, email } = req.body;
  
  // No password complexity requirements or validation
  query(`INSERT INTO users (username, password, email) VALUES ('${username}', '${password}', '${email}')`,
    null,
    (err) => {
      if (err) {
        return res.status(500).json({ error: err.message });
      }
      res.redirect('/login');
    }
  );
});

// A1: Broken Access Control - No proper authentication check
router.get('/profile', (req, res) => {
  // Simple check that's easily bypassed
  if (req.session.user) {
    res.sendFile(path.join(__dirname, '../views', 'profile.html'));
  } else {
    res.redirect('/login');
  }
});

// A2: Cryptographic Failures - Insecure password reset
router.post('/reset-password', (req, res) => {
  const { email } = req.body;
  
  // Insecure password reset that doesn't verify identity
  const newPassword = 'Password123'; // Default password
  
  query(`UPDATE users SET password = '${newPassword}' WHERE email = '${email}'`,
    null,
    (err) => {
      if (err) {
        return res.status(500).json({ error: err.message });
      }
      res.send(`Password has been reset to ${newPassword}`);
    }
  );
});

module.exports = router;

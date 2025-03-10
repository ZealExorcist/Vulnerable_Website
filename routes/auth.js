const express = require('express');
const router = express.Router();
const { query } = require('../config/database');
const config = require('../config/config');
const path = require('path'); // Add missing path import

// Add the missing GET route for login page
router.get('/login', (req, res) => {
  // Set cookie with flag
  res.cookie('debug_info', 'CTF{insecure_cookie_storage}', { httpOnly: false });
  res.sendFile(path.join(__dirname, '../views', 'login.html'));
});

// Add the missing GET route for register page
router.get('/register', (req, res) => {
  res.sendFile(path.join(__dirname, '../views', 'register.html'));
});

// A7: Identification and Authentication Failures
router.post('/login', (req, res) => {
  const { username, password } = req.body;
  console.log('Login attempt:', username, password);
  
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
        // Add a flag in session
        req.session.secretFlag = 'CTF{session_hijacking_vulnerability}';
        res.redirect('/auth/profile');
      } else {
        res.redirect('/auth/login?error=Invalid credentials');
      }
    }
  );
});

// Add a GET route for accessing the password reset page
router.get('/reset', (req, res) => {
  // Plaintext flag in HTTP header
  res.setHeader('X-Debug-Flag', 'CTF{insecure_http_headers}');
  res.sendFile(path.join(__dirname, '../views', 'reset.html'));
});

// A7: Identification and Authentication Failures - Weak registration
router.post('/register', (req, res) => {
  const { username, password, email } = req.body;
  console.log('Register attempt:', username, password, email);
  
  // No password complexity requirements or validation
  query(`INSERT INTO users (username, password, email) VALUES ('${username}', '${password}', '${email}')`,
    null,
    (err) => {
      if (err) {
        return res.status(500).json({ error: err.message });
      }
      res.redirect('/auth/login');
    }
  );
});

// Add route for the change password functionality from profile
router.post('/change-password', (req, res) => {
  const { current_password, new_password } = req.body;
  const userId = req.session.user ? req.session.user.id : null;
  
  if (!userId) {
    return res.status(401).send('Not authenticated');
  }
  
  // CSRF vulnerability - no CSRF token validation
  // SQL injection in the UPDATE statement
  query(`UPDATE users SET password = '${new_password}' WHERE id = ${userId} AND password = '${current_password}'`,
    null,
    (err, result) => {
      if (err) {
        return res.status(500).json({ 
          error: err.message,
          // Flag in error response
          debugFlag: 'CTF{csrf_missing_tokens}'
        });
      }
      res.send('Password updated successfully! <small style="display:none">CTF{password_change_success_flag}</small>');
    }
  );
});

// A1: Broken Access Control - No proper authentication check
router.get('/profile', (req, res) => {
  console.log('Profile access, session:', req.session);
  // Simple check that's easily bypassed
  if (req.session.user) {
    res.sendFile(path.join(__dirname, '../views', 'profile.html'));
  } else {
    res.redirect('/auth/login');
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
      res.send(`Password has been reset to ${newPassword} <span style="color:white;font-size:1px;">CTF{insecure_password_reset}</span>`);
    }
  );
});

// Add a logout route with an information disclosure flaw
router.get('/logout', (req, res) => {
  // Information disclosure in comment
  // CTF{session_invalidation_failure}
  req.session.destroy(() => {
    res.redirect('/?logout=true');
  });
});

module.exports = router;

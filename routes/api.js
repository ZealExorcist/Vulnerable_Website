const express = require('express');
const router = express.Router();
const { exec } = require('child_process');
const fetch = require('node-fetch');
const config = require('../config/config');
const { query } = require('../config/database');

// A10: Server-Side Request Forgery (SSRF)
router.get('/fetch-data', (req, res) => {
  const url = req.query.url;
  
  // Flag hint for SSRF
  const ssrfFlag = 'Try accessing internal resources with file:///etc/passwd or http://localhost';
  
  // No validation on URL - SSRF vulnerability
  fetch(url)
    .then(response => response.json())
    .then(data => {
      // Add a flag to successful SSRF responses
      if (url && (url.includes('localhost') || url.includes('127.0.0.1'))) {
        data.flag = "CTF{ssrf_internal_resource_access}";
      }
      res.json(data);
    })
    .catch(err => res.status(500).json({ 
      error: err.message,
      hint: ssrfFlag
    }));
});

// A3: Injection - Command Injection
router.get('/ping', (req, res) => {
  const host = req.query.host;
  
  // Command injection vulnerability
  exec(`ping -c 4 ${host}`, (error, stdout, stderr) => {
    if (error) {
      res.status(500).send(`Error: ${error.message}`);
      return;
    }
    if (stderr) {
      res.status(500).send(`Error: ${stderr}`);
      return;
    }
    
    // Add a hidden comment with flag hint
    const output = `<pre>${stdout}</pre>
    <!-- Try command injection with semicolons: 127.0.0.1; cat /etc/passwd -->
    <!-- For Windows: 127.0.0.1 & type c:\\flag.txt -->
    <!-- CTF{command_injection_vulnerability} -->`;
    
    res.send(output);
  });
});

// A2: Cryptographic Failures - Exposing sensitive information in API
router.get('/config', (req, res) => {
  // Leaking sensitive configuration
  res.json(config);
});

// Add a route to get all users - demonstrates SQL injection vulnerability
router.get('/users', (req, res) => {
  const filter = req.query.filter || '';
  
  // SQL Injection vulnerability
  query(`SELECT id, username, email, role FROM users WHERE username LIKE '%${filter}%'`, 
    null, 
    (err, rows) => {
      if (err) {
        return res.status(500).json({ error: err.message });
      }
      res.json(rows);
    }
  );
});

// Add an endpoint vulnerable to prototype pollution
router.post('/merge-settings', (req, res) => {
  const userSettings = {};
  const newSettings = req.body;
  
  // Insecure object merge (prototype pollution)
  function merge(target, source) {
    for (let key in source) {
      if (typeof source[key] === 'object' && source[key] !== null) {
        if (!target[key]) target[key] = {};
        merge(target[key], source[key]);
      } else {
        target[key] = source[key];
      }
    }
    return target;
  }
  
  const mergedSettings = merge(userSettings, newSettings);
  
  // Hidden flag for prototype pollution
  if (Object.prototype.hasOwnProperty('polluted')) {
    mergedSettings.secretFlag = 'CTF{prototype_pollution_vulnerability}';
  }
  
  res.json(mergedSettings);
});

// API information with hidden flag
router.get('/', (req, res) => {
  res.json({
    name: "Vulnerable CTF API",
    version: "1.0.0",
    endpoints: [
      "/api/users",
      "/api/ping",
      "/api/fetch-data",
      "/api/config"
    ],
    // Base64 encoded flag
    debugInfo: "Q1RGe2FwaV9pbmZvcm1hdGlvbl9kaXNjbG9zdXJlfQ=="
  });
});

module.exports = router;

const express = require('express');
const router = express.Router();
const { exec } = require('child_process');
const fetch = require('node-fetch');
const config = require('../config/config');

// A10: Server-Side Request Forgery (SSRF)
router.get('/fetch-data', (req, res) => {
  const url = req.query.url;
  
  // No validation on URL - SSRF vulnerability
  fetch(url)
    .then(response => response.json())
    .then(data => res.json(data))
    .catch(err => res.status(500).json({ error: err.message }));
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
    res.send(`<pre>${stdout}</pre>`);
  });
});

// A2: Cryptographic Failures - Exposing sensitive information in API
router.get('/config', (req, res) => {
  // Leaking sensitive configuration
  res.json(config);
});

module.exports = router;

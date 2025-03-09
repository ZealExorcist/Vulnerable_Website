const express = require('express');
const bodyParser = require('body-parser');
const session = require('express-session');
const path = require('path');
const fs = require('fs');
const app = express();
const port = 3000;

// A5: Security Misconfiguration - Revealing stack traces to users
app.use((err, req, res, next) => {
  console.error(err.stack);
  res.status(500).send(`Server Error: ${err.stack}`);
});

// A2: Cryptographic Failures - Using HTTP instead of HTTPS
// A5: Security Misconfiguration - Not setting security headers
app.use(bodyParser.urlencoded({ extended: true }));
app.use(bodyParser.json());
app.use(express.static('public'));

// A2: Cryptographic Failures - Insecure session configuration
// A7: Identification and Authentication Failures - Weak session management
app.use(session({
  secret: '1234567890', // Weak, hardcoded secret
  resave: true,
  saveUninitialized: true,
  cookie: { secure: false, httpOnly: false } // Insecure cookies
}));

// Load routes
const authRoutes = require('./routes/auth');
const adminRoutes = require('./routes/admin');
const productRoutes = require('./routes/products');
const apiRoutes = require('./routes/api');

app.use('/auth', authRoutes);
app.use('/admin', adminRoutes);
app.use('/products', productRoutes);
app.use('/api', apiRoutes);

// A9: Security Logging and Monitoring Failures - No logging of security events
app.get('/', (req, res) => {
  res.sendFile(path.join(__dirname, 'views', 'index.html'));
});

// A4: Insecure Design - Dangerous file operations
app.get('/download', (req, res) => {
  const file = req.query.file;
  // Path traversal vulnerability - allows downloading any file
  res.download(file); 
});

// A10: Server-Side Request Forgery (SSRF)
app.get('/fetch', (req, res) => {
  const url = req.query.url;
  // SSRF vulnerability - no validation of URL
  fetch(url)
    .then(response => response.text())
    .then(data => res.send(data))
    .catch(err => res.status(500).send('Error: ' + err.message));
});

app.listen(port, () => {
  console.log(`Vulnerable app listening at http://localhost:${port}`);
});

module.exports = app;

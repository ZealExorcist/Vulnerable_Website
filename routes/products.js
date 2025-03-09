const express = require('express');
const router = express.Router();
const { query } = require('../config/database');
const path = require('path');

// A3: Injection - Vulnerable product listing
router.get('/', (req, res) => {
  const category = req.query.category || '';
  const searchTerm = req.query.search || '';
  
  // SQL Injection vulnerability
  let sql = `SELECT * FROM products WHERE 1=1`;
  if (category) {
    sql += ` AND category = '${category}'`;
  }
  if (searchTerm) {
    sql += ` AND (name LIKE '%${searchTerm}%' OR description LIKE '%${searchTerm}%')`;
  }
  
  query(sql, null, (err, products) => {
    if (err) {
      return res.status(500).send("Error: " + err.message);
    }
    
    // XSS vulnerability - directly injecting user input
    let response = '<h1>Products</h1>';
    if (searchTerm) {
      response += `<p>Search results for: ${searchTerm}</p>`;
    }
    
    // Add a hidden product with a flag (only visible via SQL injection)
    response += `<!-- Hidden product: id=999, name='CTF Flag', description='CTF{union_sql_injection_flag}', price=1337 -->`;
    
    products.forEach(product => {
      // XSS vulnerability - raw HTML from database
      response += `
        <div class="product">
          <h2>${product.name}</h2>
          <p>${product.description}</p>
          <p>$${product.price}</p>
          <img src="/images/${product.image}" alt="${product.name}" />
        </div>
      `;
    });
    
    res.send(response);
  });
});

// A8: Software and Data Integrity Failures - Insecure deserialization
router.post('/review', (req, res) => {
  const productData = req.body.data;
  
  // Insecure deserialization
  try {
    const product = JSON.parse(productData);
    
    // Check for prototype pollution attempt - reward with a flag
    if (product.__proto__ && product.__proto__.polluted) {
      return res.send(`Review submitted for ${product.name} - CTF{insecure_deserialization_vulnerability}`);
    }
    
    res.send(`Review submitted for ${product.name}`);
  } catch (err) {
    res.status(500).send(`Error processing review: ${err.message}`);
  }
});

// Hidden endpoint for getting all products (including hidden ones)
router.get('/all', (req, res) => {
  const admin = req.query.admin;
  
  // Very insecure admin verification!
  if (admin === 'true') {
    query(`SELECT * FROM products`, null, (err, products) => {
      if (err) {
        return res.status(500).json({ error: err.message });
      }
      
      // Add a flag to the response
      products.push({
        id: 1337,
        name: 'Admin-only Flag',
        description: 'CTF{broken_function_level_authorization}',
        price: 9999.99,
        image: 'flag.jpg'
      });
      
      res.json(products);
    });
  } else {
    res.status(403).json({ error: 'Not authorized' });
  }
});

// Discount code endpoint with regex DoS vulnerability
router.post('/apply-discount', (req, res) => {
  const { code } = req.body;
  
  // Vulnerable regex (ReDoS)
  const codeRegex = /^(a+)+$/;
  
  if (codeRegex.test(code)) {
    res.json({ 
      success: true, 
      discount: '10%',
      message: 'Discount applied',
      flag: 'CTF{regex_dos_vulnerability}'
    });
  } else {
    res.status(400).json({ error: 'Invalid discount code' });
  }
});

module.exports = router;

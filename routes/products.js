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
  const product = JSON.parse(productData);
  
  res.send(`Review submitted for ${product.name}`);
});

module.exports = router;

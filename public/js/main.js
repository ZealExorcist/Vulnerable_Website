// A8: Software and Data Integrity Failures - Insecure frontend code

// Insecurely storing sensitive data in localStorage
function saveUserCredentials(username, password) {
  localStorage.setItem('username', username);
  localStorage.setItem('password', password);
}

// Client-side access control (easily bypassed)
function checkAdminAccess() {
  const role = localStorage.getItem('userRole');
  if (role === 'admin') {
    document.getElementById('adminPanel').style.display = 'block';
  }
}

// XSS vulnerability through DOM manipulation
function displayMessage() {
  const message = new URLSearchParams(window.location.search).get('message');
  if (message) {
    document.getElementById('message-box').innerHTML = message;
  }
}

// Insecure form submission without CSRF protection
function submitForm(formId, endpoint) {
  const form = document.getElementById(formId);
  form.action = endpoint;
  form.submit();
}

// Load user data when page loads
document.addEventListener('DOMContentLoaded', function() {
  displayMessage();
  checkAdminAccess();
  
  // Add event listeners to forms
  const loginForm = document.getElementById('login-form');
  if (loginForm) {
    loginForm.addEventListener('submit', function(e) {
      e.preventDefault();
      const username = document.getElementById('username').value;
      const password = document.getElementById('password').value;
      saveUserCredentials(username, password);
      submitForm('login-form', '/auth/login');
    });
  }
});

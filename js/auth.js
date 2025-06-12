// Load admin state from localStorage
const isAuthenticated = localStorage.getItem('isAuthenticated') === 'true';
const loginForm = document.getElementById('login-form');
const loginMessage = document.getElementById('login-message');

if (isAuthenticated && window.location.pathname.includes('login.html')) {
  window.location.href = 'dashboard.html';
}

loginForm?.addEventListener('submit', (e) => {
  e.preventDefault();
  const username = document.getElementById('username').value;
  const password = document.getElementById('password').value;

  // Simple authentication (replace with secure backend in production)
  if (username === 'admin' && password === 'admin123') {
    localStorage.setItem('isAuthenticated', 'true');
    loginMessage.textContent = 'Login successful! Redirecting...';
    setTimeout(() => window.location.href = 'dashboard.html', 1000);
  } else {
    loginMessage.textContent = 'Invalid username or password.';
  }
});

// Logout functionality
document.getElementById('logout')?.addEventListener('click', () => {
  localStorage.removeItem('isAuthenticated');
  window.location.href = '../admin/login.html';
});
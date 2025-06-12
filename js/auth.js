// Register
const registerForm = document.getElementById('register-form');
if (registerForm) {
  registerForm.addEventListener('submit', e => {
    e.preventDefault();
    const username = document.getElementById('new-username').value;
    const password = document.getElementById('new-password').value;
    const users = JSON.parse(localStorage.getItem('users')) || [];

    users.push({ username, password });
    localStorage.setItem('users', JSON.stringify(users));
    alert('Registered! You can now login.');
    registerForm.reset();
  });
}

// Login
const loginForm = document.getElementById('login-form');
if (loginForm) {
  loginForm.addEventListener('submit', e => {
    e.preventDefault();
    const username = document.getElementById('username').value;
    const password = document.getElementById('password').value;
    const users = JSON.parse(localStorage.getItem('users')) || [];

    const found = users.find(user => user.username === username && user.password === password);
    if (found) {
      alert('Login successful!');
      localStorage.setItem('loggedInUser', username);
    } else {
      alert('Invalid credentials.');
    }
  });
}

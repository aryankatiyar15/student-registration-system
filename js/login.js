const loginForm = document.getElementById('loginForm');
const message = document.getElementById('message');
const loginButton = document.getElementById('loginButton');
  const emailPattern = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

function showMessage(text, type) {
  message.textContent = text;
  message.className = `message ${type}`;
}

function setLoading(isLoading) {
  loginButton.disabled = isLoading;
  loginButton.textContent = isLoading ? 'Logging in...' : 'Login';
}

loginForm.addEventListener('submit', async (event) => {
  event.preventDefault();

  const formData = new FormData(loginForm);
  const email = formData.get('email').trim().toLowerCase();
  const password = formData.get('password');

  if (!email || !password) {
    showMessage('Email and password are required.', 'error');
    return;
  }

  if (!emailPattern.test(email)) {
    showMessage('Please enter a valid email address.', 'error');
    return;
  }

  setLoading(true);
  showMessage('', '');

  try {
    const response = await fetch('/login', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({ email, password })
    });

    const result = await response.json();

    if (!response.ok) {
      showMessage(result.message || 'Invalid email or password.', 'error');
      return;
    }

    window.location.href = '/dashboard.html';
  } catch (error) {
    showMessage('Unable to connect to the server.', 'error');
  } finally {
    setLoading(false);
  }
});

const registerForm = document.getElementById('registerForm');
const message = document.getElementById('message');
const registerButton = document.getElementById('registerButton');
const emailPattern = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

function showMessage(text, type) {
  message.textContent = text;
  message.className = `message ${type}`;
}

function setLoading(isLoading) {
  registerButton.disabled = isLoading;
  registerButton.textContent = isLoading ? 'Registering...' : 'Register';
}

registerForm.addEventListener('submit', async (event) => {
  event.preventDefault();

  const formData = new FormData(registerForm);
  const name = formData.get('name').trim();
  const email = formData.get('email').trim().toLowerCase();
  const password = formData.get('password');
  const confirmPassword = formData.get('confirmPassword');

  if (!name || !email || !password || !confirmPassword) {
    showMessage('All fields are required.', 'error');
    return;
  }

  if (!emailPattern.test(email)) {
    showMessage('Please enter a valid email address.', 'error');
    return;
  }

  if (password.length < 6) {
    showMessage('Password must be at least 6 characters long.', 'error');
    return;
  }

  if (password !== confirmPassword) {
    showMessage('Passwords do not match.', 'error');
    return;
  }

  setLoading(true);
  showMessage('', '');

  try {
    const response = await fetch('/register', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({ name, email, password, confirmPassword })
    });

    const result = await response.json();

    if (!response.ok) {
      showMessage(result.message || 'Registration failed.', 'error');
      return;
    }

    showMessage('Student Registered Successfully. Redirecting to login...', 'success');
    registerForm.reset();

    window.setTimeout(() => {
      window.location.href = '/login.html';
    }, 1600);
  } catch (error) {
    showMessage('Unable to connect to the server.', 'error');
  } finally {
    setLoading(false);
  }
});

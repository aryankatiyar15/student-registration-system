const welcomeTitle = document.getElementById('welcomeTitle');
const studentCount = document.getElementById('studentCount');
const studentsTableBody = document.getElementById('studentsTableBody');
const dashboardMessage = document.getElementById('dashboardMessage');
const logoutButton = document.getElementById('logoutButton');

function showMessage(text, type) {
  dashboardMessage.textContent = text;
  dashboardMessage.className = text ? `message message-box ${type}` : 'message';
}

function formatDate(value) {
  return new Intl.DateTimeFormat('en-IN', {
    day: '2-digit',
    month: 'short',
    year: 'numeric',
    hour: '2-digit',
    minute: '2-digit'
  }).format(new Date(value));
}

function escapeHtml(value) {
  return String(value)
    .replaceAll('&', '&amp;')
    .replaceAll('<', '&lt;')
    .replaceAll('>', '&gt;')
    .replaceAll('"', '&quot;')
    .replaceAll("'", '&#039;');
}

function renderStudents(students) {
  if (!students.length) {
    studentsTableBody.innerHTML = '<tr><td colspan="4" class="empty-state">No students registered yet.</td></tr>';
    return;
  }

  studentsTableBody.innerHTML = students.map((student) => `
    <tr>
      <td>${escapeHtml(student.id)}</td>
      <td>${escapeHtml(student.name)}</td>
      <td>${escapeHtml(student.email)}</td>
      <td>${escapeHtml(formatDate(student.created_at))}</td>
    </tr>
  `).join('');
}

async function fetchJson(url, options = {}) {
  const response = await fetch(url, options);
  const result = await response.json();

  if (!response.ok) {
    throw new Error(result.message || 'Request failed.');
  }

  return result;
}

async function loadDashboard() {
  try {
    const profile = await fetchJson('/me');
    welcomeTitle.textContent = `Welcome, ${profile.student.name}`;

    const [countResult, studentsResult] = await Promise.all([
      fetchJson('/students/count'),
      fetchJson('/students')
    ]);

    studentCount.textContent = countResult.total;
    renderStudents(studentsResult.students);
    showMessage('', '');
  } catch (error) {
    window.location.href = '/login.html';
  }
}

logoutButton.addEventListener('click', async () => {
  logoutButton.disabled = true;
  logoutButton.textContent = 'Logging out...';

  try {
    await fetch('/logout', { method: 'POST' });
  } finally {
    window.location.href = '/login.html';
  }
});

loadDashboard();

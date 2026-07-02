const express = require('express');
const bcrypt = require('bcrypt');
const crypto = require('crypto');
const { getPool } = require('../config/db');

const router = express.Router();
const sessions = new Map();

const cookieName = process.env.SESSION_COOKIE_NAME || 'student_session';
const sessionMaxAgeMs = Number(process.env.SESSION_MAX_AGE_HOURS || 2) * 60 * 60 * 1000;
const emailPattern = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

function parseCookies(cookieHeader = '') {
  return cookieHeader
    .split(';')
    .map((cookie) => cookie.trim())
    .filter(Boolean)
    .reduce((cookies, cookie) => {
      const separatorIndex = cookie.indexOf('=');

      if (separatorIndex === -1) {
        return cookies;
      }

      const key = decodeURIComponent(cookie.slice(0, separatorIndex).trim());
      const value = decodeURIComponent(cookie.slice(separatorIndex + 1).trim());
      cookies[key] = value;
      return cookies;
    }, {});
}

function createCookie(value, maxAgeSeconds) {
  return `${cookieName}=${encodeURIComponent(value)}; HttpOnly; SameSite=Strict; Path=/; Max-Age=${maxAgeSeconds}`;
}

function clearCookie() {
  return `${cookieName}=; HttpOnly; SameSite=Strict; Path=/; Max-Age=0`;
}

function removeExpiredSessions() {
  const now = Date.now();

  for (const [token, session] of sessions.entries()) {
    if (session.expiresAt <= now) {
      sessions.delete(token);
    }
  }
}

function requireAuth(req, res, next) {
  removeExpiredSessions();

  const cookies = parseCookies(req.headers.cookie);
  const token = cookies[cookieName];
  const session = token ? sessions.get(token) : null;

  if (!session) {
    return res.status(401).json({ message: 'Please login to continue.' });
  }

  req.student = session.student;
  next();
}

router.post('/register', async (req, res) => {
  try {
    const { name, email, password, confirmPassword } = req.body;
    const trimmedName = String(name || '').trim();
    const normalizedEmail = String(email || '').trim().toLowerCase();

    if (!trimmedName || !normalizedEmail || !password || !confirmPassword) {
      return res.status(400).json({ message: 'All fields are required.' });
    }

    if (!emailPattern.test(normalizedEmail)) {
      return res.status(400).json({ message: 'Please enter a valid email address.' });
    }

    if (password !== confirmPassword) {
      return res.status(400).json({ message: 'Passwords do not match.' });
    }

    if (password.length < 6) {
      return res.status(400).json({ message: 'Password must be at least 6 characters long.' });
    }

    const pool = getPool();
    const [existingStudents] = await pool.execute(
      'SELECT id FROM students WHERE email = ? LIMIT 1',
      [normalizedEmail]
    );

    if (existingStudents.length > 0) {
      return res.status(409).json({ message: 'Email is already registered.' });
    }

    const saltRounds = Number(process.env.BCRYPT_SALT_ROUNDS || 10);
    const hashedPassword = await bcrypt.hash(password, saltRounds);

    await pool.execute(
      'INSERT INTO students (name, email, password) VALUES (?, ?, ?)',
      [trimmedName, normalizedEmail, hashedPassword]
    );

    return res.status(201).json({ message: 'Student Registered Successfully' });
  } catch (error) {
    if (error.code === 'ER_DUP_ENTRY') {
      return res.status(409).json({ message: 'Email is already registered.' });
    }

    console.error('Registration error:', error);
    return res.status(500).json({ message: 'Unable to register student. Please try again.' });
  }
});

router.post('/login', async (req, res) => {
  try {
    const { email, password } = req.body;
    const normalizedEmail = String(email || '').trim().toLowerCase();

    if (!normalizedEmail || !password) {
      return res.status(400).json({ message: 'Email and password are required.' });
    }

    const pool = getPool();
    const [students] = await pool.execute(
      'SELECT * FROM students WHERE email = ? LIMIT 1',
      [normalizedEmail]
    );

    if (students.length === 0) {
      return res.status(401).json({ message: 'Invalid email or password.' });
    }

    const student = students[0];
    const isPasswordValid = await bcrypt.compare(password, student.password);

    if (!isPasswordValid) {
      return res.status(401).json({ message: 'Invalid email or password.' });
    }

    const token = crypto.randomBytes(32).toString('hex');
    const publicStudent = {
      id: student.id,
      name: student.name,
      email: student.email
    };

    sessions.set(token, {
      student: publicStudent,
      expiresAt: Date.now() + sessionMaxAgeMs
    });

    res.setHeader('Set-Cookie', createCookie(token, Math.floor(sessionMaxAgeMs / 1000)));
    return res.json({
      message: 'Login successful.',
      student: publicStudent
    });
  } catch (error) {
    console.error('Login error:', error);
    return res.status(500).json({ message: 'Unable to login. Please try again.' });
  }
});

router.get('/me', requireAuth, (req, res) => {
  return res.json({ student: req.student });
});

router.post('/logout', (req, res) => {
  const cookies = parseCookies(req.headers.cookie);
  const token = cookies[cookieName];

  if (token) {
    sessions.delete(token);
  }

  res.setHeader('Set-Cookie', clearCookie());
  return res.json({ message: 'Logged out successfully.' });
});

module.exports = {
  router,
  requireAuth
};

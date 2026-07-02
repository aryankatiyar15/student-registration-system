const express = require('express');
const { getPool } = require('../config/db');
const { requireAuth } = require('./auth');

const router = express.Router();

router.get('/count', requireAuth, async (req, res) => {
  try {
    const pool = getPool();
    const [rows] = await pool.execute('SELECT COUNT(*) AS total FROM students');

    return res.json({ total: rows[0].total });
  } catch (error) {
    console.error('Student count error:', error);
    return res.status(500).json({ message: 'Unable to load student count.' });
  }
});

router.get('/', requireAuth, async (req, res) => {
  try {
    const pool = getPool();
    const [students] = await pool.execute(
      'SELECT id, name, email, created_at FROM students ORDER BY id DESC'
    );

    return res.json({ students });
  } catch (error) {
    console.error('Student list error:', error);
    return res.status(500).json({ message: 'Unable to load students.' });
  }
});

module.exports = router;

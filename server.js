const path = require('path');
const express = require('express');
require('dotenv').config();

const { initializeDatabase } = require('./config/db');
const authRoutes = require('./routes/auth');
const studentRoutes = require('./routes/students');

const app = express();
const port = Number(process.env.PORT || 3000);

app.use(express.json());
app.use(express.urlencoded({ extended: true }));

app.use('/css', express.static(path.join(__dirname, 'css')));
app.use('/js', express.static(path.join(__dirname, 'js')));
app.use(express.static(path.join(__dirname, 'public')));

app.use('/', authRoutes.router);
app.use('/students', studentRoutes);

app.get('/', (req, res) => {
  res.redirect('/login.html');
});

app.use((req, res) => {
  res.status(404).json({ message: 'Route not found.' });
});

async function startServer() {
  try {
    await initializeDatabase();

    const server = app.listen(port, () => {
      console.log(`Student Registration System is running at http://localhost:${port}`);
    });

    server.on('error', (error) => {
      if (error.code === 'EADDRINUSE') {
        console.error(`Port ${port} is already in use. Stop the existing server or change PORT in .env.`);
        process.exit(1);
      }

      console.error('Server error:', error.message);
      process.exit(1);
    });
  } catch (error) {
    console.error('Failed to start server:', error.message);
    console.error('Check your MySQL server and .env database credentials.');
    process.exit(1);
  }
}

startServer();

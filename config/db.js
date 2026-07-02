const mysql = require('mysql2/promise');
require('dotenv').config();

let pool;

const databaseName = process.env.DB_NAME || process.env.MYSQLDATABASE || 'student_portal';
const dbHost = process.env.DB_HOST || process.env.MYSQLHOST || 'localhost';
const dbPort = Number(process.env.DB_PORT || process.env.MYSQLPORT || 3306);
const dbUser = process.env.DB_USER || process.env.MYSQLUSER || 'root';
const dbPassword = process.env.DB_PASSWORD || process.env.MYSQLPASSWORD || '';

if (!/^[a-zA-Z0-9_]+$/.test(databaseName)) {
  throw new Error('DB_NAME can contain only letters, numbers, and underscores.');
}

async function initializeDatabase() {
  const setupConnection = await mysql.createConnection({
    host: dbHost,
    port: dbPort,
    user: dbUser,
    password: dbPassword,
    multipleStatements: false
  });

  try {
    await setupConnection.query(`CREATE DATABASE IF NOT EXISTS \`${databaseName}\``);
  } catch (error) {
    if (!['ER_DBACCESS_DENIED_ERROR', 'ER_DB_CREATE_EXISTS'].includes(error.code)) {
      throw error;
    }
  } finally {
    await setupConnection.end();
  }

  const tableConnection = await mysql.createConnection({
    host: dbHost,
    port: dbPort,
    user: dbUser,
    password: dbPassword,
    database: databaseName,
    multipleStatements: false
  });

  await tableConnection.query(`
    CREATE TABLE IF NOT EXISTS students (
      id INT AUTO_INCREMENT PRIMARY KEY,
      name VARCHAR(100) NOT NULL,
      email VARCHAR(100) NOT NULL UNIQUE,
      password VARCHAR(255) NOT NULL,
      created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
    )
  `);

  await tableConnection.end();

  pool = mysql.createPool({
    host: dbHost,
    port: dbPort,
    user: dbUser,
    password: dbPassword,
    database: databaseName,
    waitForConnections: true,
    connectionLimit: 10,
    queueLimit: 0
  });
}

function getPool() {
  if (!pool) {
    throw new Error('Database pool has not been initialized.');
  }

  return pool;
}

module.exports = {
  initializeDatabase,
  getPool
};

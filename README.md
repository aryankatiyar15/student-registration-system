# Student Registration & Login System

A complete Student Registration and Login System built for demonstrating MySQL database connectivity and dynamic authentication in a Database Developer interview.

The project uses HTML5, CSS3, Vanilla JavaScript, Node.js, Express.js, MySQL, mysql2, bcrypt, and dotenv. Login credentials are never hardcoded. Students register through the website, passwords are hashed with bcrypt, and the dashboard reads student data directly from MySQL.

## Features

- Student registration with required field validation
- Email format validation
- Confirm password validation
- Unique email validation using MySQL
- Password hashing with bcrypt
- Login authentication from MySQL
- HTTP-only session cookie after successful login
- Dashboard welcome message for the logged-in student
- Total registered students using `SELECT COUNT(*)`
- Dynamic student table using MySQL data
- Prepared statements for SQL injection protection
- No password exposure in dashboard APIs
- Professional responsive UI without Bootstrap
- Automatic database and table creation on server startup

## Folder Structure

```text
student-registration-system/
├── public/
│   ├── login.html
│   ├── register.html
│   └── dashboard.html
├── css/
│   └── style.css
├── js/
│   ├── login.js
│   ├── register.js
│   └── dashboard.js
├── config/
│   └── db.js
├── routes/
│   ├── auth.js
│   └── students.js
├── server.js
├── package.json
├── .env
├── database.sql
└── README.md
```

## MySQL Setup

1. Start your MySQL server.
2. Open `.env`.
3. Match these values to your local MySQL installation:

```env
DB_HOST=localhost
DB_PORT=3306
DB_USER=root
DB_PASSWORD=
DB_NAME=student_portal
```

By default, the app creates the `student_portal` database and `students` table automatically when `npm start` runs. The `database.sql` file is also included to show the exact database structure used by the project.

## Environment Variables

```env
PORT=3000
DB_HOST=localhost
DB_PORT=3306
DB_USER=root
DB_PASSWORD=
DB_NAME=student_portal
BCRYPT_SALT_ROUNDS=10
SESSION_COOKIE_NAME=student_session
SESSION_MAX_AGE_HOURS=2
```

## Installation

Install dependencies:

```bash
npm install
```

Start the application:

```bash
npm start
```

Open the website:

```text
http://localhost:3000
```

## Website Flow

1. Open the registration page.
2. Enter student name, email, password, and confirm password.
3. Click Register.
4. Student data is inserted into MySQL.
5. The page displays `Student Registered Successfully`.
6. The website redirects to the login page.
7. Login using the registered email and password.
8. The backend validates credentials from MySQL.
9. The dashboard opens.
10. The dashboard displays the logged-in student's name, total student count, and all registered students from MySQL.

## API Endpoints

### POST `/register`

Registers a new student.

Uses:

```sql
INSERT INTO students (name, email, password) VALUES (?, ?, ?)
```

### POST `/login`

Authenticates a student using email and password.

Uses:

```sql
SELECT * FROM students WHERE email = ? LIMIT 1
```

### GET `/students/count`

Returns total registered students.

Uses:

```sql
SELECT COUNT(*) AS total FROM students
```

### GET `/students`

Returns all registered students without passwords.

Uses:

```sql
SELECT id, name, email, created_at FROM students ORDER BY id DESC
```

## Database Table

```sql
CREATE TABLE IF NOT EXISTS students (
  id INT AUTO_INCREMENT PRIMARY KEY,
  name VARCHAR(100) NOT NULL,
  email VARCHAR(100) NOT NULL UNIQUE,
  password VARCHAR(255) NOT NULL,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);
```

## Security Notes

- Passwords are hashed using bcrypt before storing in MySQL.
- Login checks use `bcrypt.compare`.
- All SQL queries use mysql2 prepared statements.
- Dashboard APIs never return password hashes.
- The login session is stored using an HTTP-only cookie.

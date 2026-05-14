# Enrollment System - Debug & Setup Guide

## Project Structure
- **ULO-backend**: PHP REST API backend
- **ULO-frontend**: React frontend with Vite

## Prerequisites
- PHP 7.4+ with OpenSSL extension
- MySQL database
- Node.js 16+
- npm or yarn

## Backend Setup

### 1. Database Configuration
The backend expects a MySQL database with the following credentials (from `.env`):
```
SERVER01=localhost
DATABASE=bscs3a_services
USER=bscs3a
PWORD=testaccount1234
CHARSET=utf8mb4
```

**Make sure your MySQL database exists and matches these credentials.**

### 2. Install PHP Dependencies
```bash
cd ULO-backend
composer install
```

### 3. Run Backend Server
```bash
# Using PHP built-in server with router
cd ULO-backend
php -S localhost:8000 router.php
```

The backend will be available at `http://localhost:8000`

### 4. API Endpoints
All requests are POST to: `http://localhost:8000/{endpoint}`

**Authentication:**
- **POST** `/auth/login` - Login user
  - Request: `{ username, password }`
  - Response: `{ token, studnum, username, role, fname, lname }`

- **POST** `/auth/register` - Register new user
  - Request: `{ studnum, username, password, fname, lname, dob, sex }`

**Courses:**
- **POST** `/courses` - Get all courses
- **POST** `/courses/{id}` - Get course by ID

**Enrollments:**
- **POST** `/enrollments` - Enroll student in course
- **POST** `/enrollments/student` - Get student enrollments

**Users:**
- **PATCH** `/users/profile` - Update user profile

## Frontend Setup

### 1. Install Dependencies
```bash
cd ULO-frontend
npm install
```

### 2. Configure API URL
Edit `.env`:
```
VITE_API_URL=http://localhost:8000
```

### 3. Run Development Server
```bash
npm run dev
```

The frontend will be available at `http://localhost:5173`

### 4. Build for Production
```bash
npm run build
```

## Data Encryption

### Backend
- Uses **AES-256-GCM** for encryption
- Secret key: `a-string-secret-at-least-256-bit` (.env)
- All request/response bodies are encrypted by default

### Frontend API Client
- Supports both encrypted and plain JSON
- Auto-detects encrypted responses
- Encrypts sensitive requests (login, registration, profile updates)

## Common Issues & Solutions

### Issue: CORS Errors
**Error**: `Access to XMLHttpRequest blocked by CORS policy`
- **Solution**: CORS headers are now configured in `main.php`
- Make sure browser allows cross-origin requests

### Issue: Backend 400/500 Error
**Error**: `Invalid encrypted data`
- **Solution**: Ensure request data is properly encrypted
- Check `.env` file for correct SECRET and ALGO values

### Issue: Login Fails with "Invalid credentials"
- Verify database connection in `.env`
- Check that user exists in database
- Verify user's `fld_hasaccess` flag is set to '1'

### Issue: Frontend Can't Connect to Backend
- Verify backend server is running: `http://localhost:8000`
- Check VITE_API_URL in `.env`
- Open browser DevTools > Network tab to see request details

## Testing

### Test Login (Sample Credentials from Database)
Username: `S2026001`
Password: `student123`
(Or use your database credentials)

### Manual API Testing with curl
```bash
# Test backend is running
curl http://localhost:8000/auth/login

# Test login (requires encryption)
curl -X POST http://localhost:8000/auth/login \
  -H "Content-Type: application/json" \
  -d '{"payload":"..."}'  # encrypted data
```

## Debugging

### Enable Console Logging
Open browser DevTools and check:
1. **Console tab** - JavaScript errors
2. **Network tab** - API requests/responses
3. **Application tab** - Session storage (user data)

### Backend Debug
Add `error_reporting(E_ALL); ini_set('display_errors', 1);` to `main.php`

### Check Database
```sql
-- Verify user exists
SELECT * FROM users WHERE fld_username = 'S2026001';

-- Check enrollment records
SELECT * FROM enrollments;
```

## Security Notes
- Keep SECRET key secure in production
- Use HTTPS in production (change CORS origin from *)
- Implement rate limiting for login attempts
- Use environment variables for sensitive data

## Next Steps
1. Run backend server: `php -S localhost:8000` (ULO-backend folder)
2. Run frontend server: `npm run dev` (ULO-frontend folder)
3. Open `http://localhost:5173` in browser
4. Test login with database credentials

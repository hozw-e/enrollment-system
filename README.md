# Enrollment System - Fixed & Connected

A full-stack enrollment management system with PHP backend and React frontend, now fully debugged and connected.

## ✅ What Was Fixed

### Backend Issues (PHP)
- ✓ Added CORS headers for frontend communication
- ✓ Removed undefined `Products` class reference
- ✓ Fixed data decryption to handle both encrypted and plain JSON
- ✓ Improved error handling for invalid requests
- ✓ Fixed Auth login validation for user access control
- ✓ Consistent JSON response format

### Frontend Issues (React)
- ✓ Replaced hardcoded login credentials with actual API calls
- ✓ Created API client utility (`apiClient.js`) for backend communication
- ✓ Updated Login component to use authentication API
- ✓ Added loading states and proper error handling
- ✓ Configured Vite proxy and environment variables
- ✓ Added session storage for authenticated user data

## 📁 Project Structure

```
enrollment-system/
├── ULO-backend/              # PHP REST API
│   ├── main.php             # Main router with CORS
│   ├── functions.php        # Encryption & auth utilities
│   ├── models/              # Database models
│   │   ├── Auth.php         # Authentication
│   │   ├── Connection.php   # DB connection
│   │   ├── Users.php
│   │   ├── Courses.php
│   │   ├── Enrollments.php
│   │   └── ...
│   ├── config/
│   │   └── .env             # Database credentials
│   ├── .htaccess            # URL rewriting
│   └── composer.json        # PHP dependencies
│
├── ULO-frontend/            # React Vite app
│   ├── src/
│   │   ├── main.jsx
│   │   ├── App.jsx          # Routes & auth
│   │   ├── pages/           # Components
│   │   │   ├── Login.jsx    # FIXED - Now uses API
│   │   │   ├── studentDashboard.jsx
│   │   │   └── ...
│   │   └── utils/
│   │       └── apiClient.js # NEW - API communication
│   ├── .env                 # NEW - API URL config
│   ├── vite.config.js       # UPDATED - Proxy config
│   └── package.json
│
├── SETUP_GUIDE.md          # Comprehensive setup guide
├── TROUBLESHOOTING.md      # Common issues & solutions
├── quick-start.bat         # Windows batch script
└── README.md               # This file
```

## 🚀 Quick Start

### Prerequisites
- PHP 7.4+ (with OpenSSL)
- Node.js 16+
- MySQL 5.7+
- Git

### Setup & Run

#### 1. Backend Setup
```bash
cd ULO-backend
# Install PHP dependencies
composer install
# Start PHP server
php -S localhost:8000
```

#### 2. Frontend Setup
```bash
cd ULO-frontend
# Install dependencies
npm install
# Start dev server
npm run dev
```

#### 3. Access Application
- **Frontend**: http://localhost:5173
- **Backend API**: http://localhost:8000
- **Database**: Configure in `ULO-backend/config/.env`

## 📋 API Endpoints

All requests are **POST** to `http://localhost:8000/{endpoint}`

### Authentication
- `POST /auth/login` - Login user
- `POST /auth/register` - Register new user

### Courses
- `POST /courses` - Get all courses
- `POST /courses/{id}` - Get course details

### Enrollments  
- `POST /enrollments` - Enroll in course
- `POST /enrollments/student` - Get student enrollments

### Users
- `PATCH /users/profile` - Update profile

## 🔐 Security

### Encryption
- Requests can be plain JSON or encrypted
- Responses are encrypted with AES-256-GCM
- Encryption keys in `config/.env`

### Authentication
- JWT tokens (from backend)
- Session storage on frontend
- Role-based access control (student/admin)

## 🛠️ Configuration

### Backend (.env)
```env
SERVER01=localhost
DATABASE=bscs3a_services
USER=bscs3a
PWORD=testaccount1234
CHARSET=utf8mb4
SECRET=a-string-secret-at-least-256-bit
ALGO=AES-256-GCM
```

### Frontend (.env)
```env
VITE_API_URL=http://localhost:8000
```

## 📚 API Client Usage

```javascript
import { login, getCourses, enrollCourse } from './utils/apiClient';

// Login
const result = await login('username', 'password');
if (result.success) {
  const user = result.user;
  // Navigate to dashboard
}

// Get courses
const courses = await getCourses();

// Enroll in course
const enrollment = await enrollCourse('course_id');
```

## 🐛 Troubleshooting

See [TROUBLESHOOTING.md](TROUBLESHOOTING.md) for:
- CORS errors
- Database connection issues
- Login failures
- Port conflicts
- And more...

### Quick Debug Steps
1. Check backend is running: `curl http://localhost:8000/auth/login`
2. Check frontend console for errors (F12)
3. Verify database credentials in `.env`
4. Check MySQL is running
5. See TROUBLESHOOTING.md for detailed solutions

## 📝 Database

### Required Tables/Stored Procedures
- `loginAccount()` - Stored procedure for login
- `registerAccount()` - Stored procedure for registration
- `users` table with fields: `fld_username`, `fld_pword`, `fld_role`, `fld_hasaccess`

See `enrollment_system.sql` and `procedures.sql` in `ULO-backend` for schema.

## 🔄 Development Workflow

```bash
# 1. Start backend (Terminal 1)
cd ULO-backend
php -S localhost:8000

# 2. Start frontend (Terminal 2)
cd ULO-frontend
npm run dev

# 3. Open browser
# http://localhost:5173

# 4. Test with database credentials
```

## 📦 Frontend Build

```bash
cd ULO-frontend

# Development
npm run dev

# Production build
npm run build

# Preview production build
npm run preview

# Lint code
npm run lint
```

## 🎯 Features Implemented

- ✅ Secure user authentication
- ✅ Student dashboard
- ✅ Course browsing and enrollment
- ✅ Admin panel for course management
- ✅ Enrollment records
- ✅ Reports generation
- ✅ User profile management
- ✅ Role-based access control
- ✅ Encrypted data transmission
- ✅ JWT token authentication
- ✅ CORS enabled for development

## 📖 Next Steps

1. **Test Login**: Use credentials from database
2. **Verify Database**: Check users exist with `fld_hasaccess = '1'`
3. **Check Console**: Open DevTools for any errors
4. **Review Logs**: Check browser and backend console output
5. **Read Guides**: See SETUP_GUIDE.md and TROUBLESHOOTING.md

## 🤝 Support

For issues or questions:
1. Check TROUBLESHOOTING.md
2. Review console errors (F12 > Console)
3. Check backend response in Network tab
4. Verify database credentials and connection
5. Check SETUP_GUIDE.md for detailed instructions

## 📄 License

[Your License Here]

## 👥 Authors

Enrollment System Development Team

---

**Last Updated**: May 14, 2026
**Status**: ✅ Debugged & Ready for Testing

# Troubleshooting Guide

## Common Issues & Solutions

### 1. CORS Errors in Browser Console

**Error**: `Access to XMLHttpRequest at 'http://localhost:8000/...' from origin 'http://localhost:5173' has been blocked by CORS policy`

**Causes**:
- Backend not returning CORS headers
- Browser blocking cross-origin requests
- Development server not configured correctly

**Solutions**:
✓ CORS headers are already configured in `ULO-backend/main.php`
✓ Make sure both backend and frontend are running
✓ Verify URLs match in frontend `.env` and `vite.config.js`

### 2. 404 Errors from API

**Error**: `POST http://localhost:8000/auth/login 404 (Not Found)`

**Causes**:
- Backend URL is wrong
- .htaccess is not working
- PHP server is not running
- Endpoint path is incorrect

**Solutions**:
- Verify backend is running: `php -S localhost:8000`
- Check `.htaccess` exists in `ULO-backend` folder
- Verify VITE_API_URL in `.env` is `http://localhost:8000`
- Check endpoint path matches backend routing in `main.php`

### 3. Database Connection Error

**Error**: `Connection Error: SQLSTATE[HY000]: General error`

**Causes**:
- MySQL server not running
- Wrong credentials in `.env`
- Database doesn't exist
- User doesn't have permission

**Solutions**:
- Start MySQL server:
  ```
  # Windows
  net start MySQL80  (or your MySQL service name)
  
  # macOS
  brew services start mysql
  
  # Linux
  sudo systemctl start mysql
  ```
- Verify credentials in `ULO-backend/config/.env`:
  ```
  SERVER01=localhost
  DATABASE=bscs3a_services
  USER=bscs3a
  PWORD=testaccount1234
  ```
- Test connection manually:
  ```bash
  mysql -h localhost -u bscs3a -p
  # Enter password: testaccount1234
  # Should see MySQL prompt
  ```

### 4. Login Returns "Invalid credentials"

**Causes**:
- User doesn't exist in database
- Password is wrong
- User account is disabled (fld_hasaccess = '0')
- Database lookup stored procedure failed

**Solutions**:
- Verify user exists in database:
  ```sql
  SELECT fld_studnum, fld_username, fld_role, fld_hasaccess 
  FROM users 
  WHERE fld_username = 'your_username';
  ```
- Check user has access:
  ```sql
  UPDATE users 
  SET fld_hasaccess = '1' 
  WHERE fld_username = 'your_username';
  ```
- Test with known credentials or check database directly
- Look at browser DevTools Console for more details

### 5. Blank Page After Login

**Causes**:
- Navigation failed silently
- Missing route component
- Session storage not set correctly
- Page is loading but blank

**Solutions**:
- Check browser console for JavaScript errors
- Open DevTools and check Application > Session Storage for user data
- Verify `sessionStorage.setItem()` is being called in Login.jsx
- Check that student/admin role matches route protection in App.jsx

### 6. Decryption Errors

**Error**: `Decryption error` in browser console

**Causes**:
- Response is not properly encrypted
- Encryption key mismatch
- Invalid encrypted data format
- Backend encryption failed

**Solutions**:
- Verify SECRET in `ULO-backend/config/.env`:
  ```
  SECRET=a-string-secret-at-least-256-bit
  ALGO=AES-256-GCM
  ```
- Frontend will fall back to plain JSON if decryption fails
- Check backend logs for encryption errors

### 7. Frontend Can't Find Backend

**Error**: `Failed to fetch` or connection timeout

**Causes**:
- Backend server not running
- Firewall blocking connection
- Wrong port number
- Network issue

**Solutions**:
- Verify backend is running: `php -S localhost:8000`
- Check firewall allows port 8000
- Try accessing `http://localhost:8000/auth/login` directly in browser
- Look at Network tab in DevTools to see request details

### 8. Node Modules or Dependencies Missing

**Error**: `Cannot find module 'react'` or `npm ERR!`

**Causes**:
- Dependencies not installed
- package.json corrupted
- npm cache issues

**Solutions**:
```bash
cd ULO-frontend
rm -rf node_modules package-lock.json
npm cache clean --force
npm install
npm run dev
```

### 9. Port Already in Use

**Error**: `EADDRINUSE: address already in use :::8000` or `:5173`

**Causes**:
- Another process using the port
- Previous server not properly closed

**Solutions**:
```bash
# Find process using port 8000
netstat -ano | findstr :8000  # Windows
lsof -i :8000  # macOS/Linux

# Kill the process
taskkill /PID [PID] /F  # Windows
kill -9 [PID]  # macOS/Linux

# Or use different port
php -S localhost:8001
```

### 10. Environment Variables Not Loading

**Error**: `undefined` for API_BASE_URL

**Causes**:
- `.env` file not in correct location
- Variable name wrong
- Vite server not restarted

**Solutions**:
- Create `.env` in `ULO-frontend` root:
  ```
  VITE_API_URL=http://localhost:8000
  ```
- Restart dev server: `npm run dev`
- Verify with `import.meta.env.VITE_API_URL` in console

## Debug Checklist

Before reporting issues, verify:
- [ ] MySQL server is running
- [ ] PHP server is running on `localhost:8000`
- [ ] npm dev server is running on `localhost:5173`
- [ ] `.env` files are in correct locations
- [ ] Database credentials are correct
- [ ] User exists in database with `fld_hasaccess = '1'`
- [ ] No errors in browser console
- [ ] No errors in backend console
- [ ] Frontend can reach backend (Network tab)

## Getting More Details

### Browser DevTools
1. Open DevTools (F12)
2. Go to Network tab
3. Attempt login
4. Click on `/auth/login` request
5. Check Response and Headers tabs

### Backend Logs
Add to `ULO-backend/main.php` after CORS headers:
```php
error_log($_SERVER['REQUEST_METHOD'] . ' ' . $_SERVER['REQUEST_URI']);
error_log(json_encode($_GET));
error_log($input);
```

### Database Logs
```bash
# Monitor MySQL queries (on your MySQL server)
SET GLOBAL general_log = 'ON';
SET GLOBAL log_output = 'TABLE';
SELECT * FROM mysql.general_log;
```

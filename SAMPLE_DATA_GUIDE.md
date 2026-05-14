# How to Populate Database with Sample Data

This guide explains how to load sample data into your enrollment system database.

## Quick Start

### Option 1: Using MySQL Command Line

```bash
# Navigate to the backend directory
cd ULO-backend

# Run the sample data script
mysql -h localhost -u bscs3a -p < sample_data.sql
# Enter password: testaccount1234
```

### Option 2: Using MySQL Workbench

1. Open MySQL Workbench
2. Create a new connection or use existing one
3. Open a new SQL tab
4. Click File → Open SQL Script
5. Select `sample_data.sql`
6. Click the Execute button (lightning icon)
7. Refresh the database to see the data

### Option 3: Using phpMyAdmin

1. Open phpMyAdmin (usually at `http://localhost/phpmyadmin`)
2. Click on the database `bscs3a_services` (or similar)
3. Click the "Import" tab
4. Click "Choose File" and select `sample_data.sql`
5. Click "Go" to import

## Sample Data Included

### Accounts (10 total)

| Username | Type | Password | Role |
|----------|------|----------|------|
| admin001 | Admin | admin123 | Admin |
| S2026001 | Student | student123 | Student |
| S2026002 | Student | student123 | Student |
| S2026003 | Student | student123 | Student |
| S2026004 | Student | student123 | Student |
| S2026005 | Student | student123 | Student |
| S2026006 | Student | student123 | Student |
| S2026007 | Student | student123 | Student |
| S2026008 | Student | student123 | Student |
| S2026009 | Student | student123 | Student |
| S2026010 | Student | student123 | Student |

### Courses (12 total)

BSCS101 - Introduction to Programming  
BSCS102 - Data Structures  
BSCS103 - Object-Oriented Programming  
BSCS104 - Web Development  
BSCS201 - Database Management Systems  
BSCS202 - Computer Networks  
BSCS203 - Operating Systems  
BSCS204 - Software Engineering  
BSCS301 - Advanced Algorithms  
BSCS302 - Mobile Application Development  
BSCS303 - Machine Learning Fundamentals  
BSCS304 - Cybersecurity Essentials  

### Students (10 total)

Each student has complete information including:
- Student number
- First name, middle name, last name
- Date of birth
- Gender
- Multiple course enrollments (2-3 courses each)

### Enrollments (30 total)

Each student is enrolled in multiple courses with various statuses:
- Most are "enrolled" (active)
- Some are "completed" with grades
- With optional remarks

## Testing the Data

### Test Admin Login

1. Start the backend: `php -S localhost:8000`
2. Start the frontend: `npm run dev`
3. Open `http://localhost:5173`
4. Login with:
   - Username: `admin001`
   - Password: `admin123`
5. You should see the admin dashboard

### Test Student Login

1. Open `http://localhost:5173`
2. Login with:
   - Username: `S2026001` (or any S2026002-S2026010)
   - Password: `student123`
3. You should see the student dashboard with their enrollments

## Verify Data in Database

### Check Accounts

```sql
USE bscs3a_accounts;
SELECT * FROM tbl_accounts;
-- Should show 11 rows (1 admin + 10 students)
```

### Check Students

```sql
USE bscs3a_students;
SELECT * FROM tbl_information;
-- Should show 10 rows
```

### Check Courses

```sql
USE bscs3a_admin;
SELECT * FROM tbl_courses;
-- Should show 12 rows
```

### Check Enrollments

```sql
USE bscs3a_students;
SELECT 
  e.fld_studnum,
  i.fld_fname,
  i.fld_lname,
  c.fld_course_code,
  c.fld_course_name,
  e.fld_status
FROM tbl_enrollments e
JOIN tbl_information i ON e.fld_studnum = i.fld_studnum
JOIN bscs3a_admin.tbl_courses c ON e.fld_course_id = c.fld_course_id
ORDER BY e.fld_studnum;
-- Should show 30 rows with enrollments
```

## Clearing Data (if needed)

To reset the database and remove all sample data:

```sql
-- Clear enrollments first (foreign key constraint)
USE bscs3a_students;
TRUNCATE TABLE tbl_enrollments;
TRUNCATE TABLE tbl_information;

-- Then clear accounts
USE bscs3a_accounts;
TRUNCATE TABLE tbl_accounts;

-- Then clear courses
USE bscs3a_admin;
TRUNCATE TABLE tbl_courses;
```

## Generating New Credentials

If you want to change the passwords for testing:

1. Edit `generate_hashes.php`
2. Change the test passwords in the `$testPasswords` array
3. Run: `php generate_hashes.php`
4. Copy the new hashes to `sample_data.sql`
5. Re-import the data

## Customizing Sample Data

To add or modify sample data:

1. Open `sample_data.sql` in a text editor
2. Find the section you want to modify
3. Add or edit the INSERT statements
4. Save the file
5. Re-import using one of the methods above

### Adding More Students

```sql
INSERT INTO bscs3a_accounts.tbl_accounts (fld_studnum, fld_username, fld_pword, fld_role, fld_hasaccess)
VALUES ('S2026011', 'S2026011', '[PASSWORD_HASH]', 0, '1');

INSERT INTO bscs3a_students.tbl_information (fld_studnum, fld_fname, fld_mname, fld_lname, fld_extname, fld_dob, fld_sex, fld_cvistatus, fld_isdeleted)
VALUES ('S2026011', 'FirstName', 'MiddleName', 'LastName', NULL, '2006-01-01', 'Male', 0, 0);
```

### Adding More Courses

```sql
INSERT INTO bscs3a_admin.tbl_courses (fld_course_code, fld_course_name, fld_description, fld_units, fld_max_students, fld_is_active)
VALUES ('BSCS305', 'Course Name', 'Course Description', 3, 30, 1);
```

### Adding Enrollments

```sql
INSERT INTO bscs3a_students.tbl_enrollments (fld_studnum, fld_course_id, fld_status, fld_remarks)
VALUES ('S2026001', 1, 'enrolled', NULL);
```

## Troubleshooting

### Error: "Access denied for user"

Make sure you're using the correct credentials from `config/.env`:
- User: `bscs3a`
- Password: `testaccount1234`

### Error: "Table doesn't exist"

Make sure the databases and tables were created by running `enrollment_system.sql` first:

```bash
mysql -h localhost -u bscs3a -p < enrollment_system.sql
# Then run the sample data:
mysql -h localhost -u bscs3a -p < sample_data.sql
```

### Password doesn't work after import

The passwords in `sample_data.sql` are bcrypt hashes. If you get "Invalid credentials":

1. Verify the hashes are correct using `generate_hashes.php`
2. Check that the database was imported correctly
3. Try logging in with the exact username and password

### Student can't see enrollments

Make sure the enrollment data was imported correctly:

```sql
SELECT * FROM bscs3a_students.tbl_enrollments WHERE fld_studnum = 'S2026001';
```

---

**You're all set!** Your database now has sample data for testing. 🎉

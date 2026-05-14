-- =============================================
-- Student Course Enrollment System
-- Separated into different databases:
--   bscs3a_accounts  -> tbl_accounts
--   bscs3a_students  -> tbl_information, tbl_enrollments
--   bscs3a_admin     -> tbl_courses
--   bscs3a_services  -> All stored procedures
-- =============================================


-- =============================================
-- DATABASE: bscs3a_accounts
-- =============================================

CREATE DATABASE IF NOT EXISTS bscs3a_accounts;
USE bscs3a_accounts;

CREATE TABLE IF NOT EXISTS tbl_accounts (
  fld_studnum VARCHAR(10) NOT NULL PRIMARY KEY,
  fld_username VARCHAR(50) DEFAULT NULL,
  fld_pword TEXT DEFAULT NULL,
  fld_role TINYINT(1) NOT NULL DEFAULT 0,
  fld_hasaccess TEXT DEFAULT NULL
);


-- =============================================
-- DATABASE: bscs3a_students
-- =============================================

CREATE DATABASE IF NOT EXISTS bscs3a_students;
USE bscs3a_students;

CREATE TABLE IF NOT EXISTS tbl_information (
  fld_studnum VARCHAR(10) NOT NULL,
  fld_fname VARCHAR(100) DEFAULT NULL,
  fld_mname VARCHAR(100) DEFAULT NULL,
  fld_lname VARCHAR(100) DEFAULT NULL,
  fld_extname VARCHAR(50) DEFAULT NULL,
  fld_dob DATE DEFAULT NULL,
  fld_sex VARCHAR(10) DEFAULT NULL,
  fld_cvistatus TINYINT(1) DEFAULT 0,
  fld_isdeleted TINYINT(1) DEFAULT 0,
  fld_timestamp DATETIME DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE IF NOT EXISTS tbl_enrollments (
  fld_enrollment_id INT AUTO_INCREMENT PRIMARY KEY,
  fld_studnum VARCHAR(10) NOT NULL,
  fld_course_id INT NOT NULL,
  fld_enrollment_date DATETIME DEFAULT CURRENT_TIMESTAMP,
  fld_status ENUM('enrolled','dropped','completed') NOT NULL DEFAULT 'enrolled',
  fld_remarks TEXT,
  UNIQUE KEY unique_enrollment (fld_studnum, fld_course_id)
);


-- =============================================
-- DATABASE: bscs3a_admin
-- =============================================

CREATE DATABASE IF NOT EXISTS bscs3a_admin;
USE bscs3a_admin;

CREATE TABLE IF NOT EXISTS tbl_courses (
  fld_course_id INT AUTO_INCREMENT PRIMARY KEY,
  fld_course_code VARCHAR(20) NOT NULL UNIQUE,
  fld_course_name VARCHAR(150) NOT NULL,
  fld_description TEXT,
  fld_units INT NOT NULL DEFAULT 3,
  fld_max_students INT NOT NULL DEFAULT 40,
  fld_is_active TINYINT(1) NOT NULL DEFAULT 1,
  fld_created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
  fld_updated_at DATETIME DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
);


-- =============================================
-- STORED PROCEDURES (in bscs3a_services)
-- All procedures use cross-database references:
--   bscs3a_accounts.tbl_accounts
--   bscs3a_students.tbl_information
--   bscs3a_students.tbl_enrollments
--   bscs3a_admin.tbl_courses
--
-- fld_role: 0 = student, 1 = admin
-- =============================================

USE bscs3a_services;

DELIMITER //

-- ---------------------------------------------
-- AUTH PROCEDURES
-- ---------------------------------------------

-- Register a new account and information record
DROP PROCEDURE IF EXISTS registerAccount//
CREATE PROCEDURE registerAccount(
  IN p_studnum VARCHAR(10),
  IN p_username VARCHAR(50),
  IN p_pword TEXT,
  IN p_fname VARCHAR(100),
  IN p_mname VARCHAR(100),
  IN p_lname VARCHAR(100),
  IN p_extname VARCHAR(50),
  IN p_dob DATE,
  IN p_sex VARCHAR(10)
)
BEGIN
  INSERT INTO bscs3a_accounts.tbl_accounts (fld_studnum, fld_username, fld_pword, fld_role, fld_hasaccess)
  VALUES (p_studnum, p_username, p_pword, 0, NULL);

  INSERT INTO bscs3a_students.tbl_information (fld_studnum, fld_fname, fld_mname, fld_lname, fld_extname, fld_dob, fld_sex, fld_cvistatus, fld_isdeleted)
  VALUES (p_studnum, p_fname, p_mname, p_lname, p_extname, p_dob, p_sex, 0, 0);

  SELECT a.fld_studnum, a.fld_username, a.fld_role
  FROM bscs3a_accounts.tbl_accounts a
  WHERE a.fld_studnum = p_studnum;
END//

-- Login: get account by username
DROP PROCEDURE IF EXISTS loginAccount//
CREATE PROCEDURE loginAccount(
  IN p_username VARCHAR(50)
)
BEGIN
  SELECT a.fld_studnum, a.fld_username, a.fld_pword, a.fld_role, a.fld_hasaccess,
         i.fld_fname, i.fld_lname
  FROM bscs3a_accounts.tbl_accounts a
  LEFT JOIN bscs3a_students.tbl_information i ON a.fld_studnum = i.fld_studnum
  WHERE a.fld_username = p_username;
END//


-- ---------------------------------------------
-- PROFILE / USER PROCEDURES
-- ---------------------------------------------

-- Get user profile by studnum
DROP PROCEDURE IF EXISTS getUserProfile//
CREATE PROCEDURE getUserProfile(
  IN p_studnum VARCHAR(10)
)
BEGIN
  SELECT a.fld_studnum, a.fld_username, a.fld_role,
         i.fld_fname, i.fld_mname, i.fld_lname, i.fld_extname,
         i.fld_dob, i.fld_sex, i.fld_cvistatus
  FROM bscs3a_accounts.tbl_accounts a
  LEFT JOIN bscs3a_students.tbl_information i ON a.fld_studnum = i.fld_studnum
  WHERE a.fld_studnum = p_studnum AND i.fld_isdeleted = 0;
END//

-- Update user profile
DROP PROCEDURE IF EXISTS updateUserProfile//
CREATE PROCEDURE updateUserProfile(
  IN p_studnum VARCHAR(10),
  IN p_fname VARCHAR(100),
  IN p_mname VARCHAR(100),
  IN p_lname VARCHAR(100),
  IN p_extname VARCHAR(50),
  IN p_dob DATE,
  IN p_sex VARCHAR(10)
)
BEGIN
  UPDATE bscs3a_students.tbl_information
  SET fld_fname = p_fname,
      fld_mname = p_mname,
      fld_lname = p_lname,
      fld_extname = p_extname,
      fld_dob = p_dob,
      fld_sex = p_sex
  WHERE fld_studnum = p_studnum;

  SELECT i.fld_studnum, i.fld_fname, i.fld_mname, i.fld_lname, i.fld_extname,
         i.fld_dob, i.fld_sex
  FROM bscs3a_students.tbl_information i
  WHERE i.fld_studnum = p_studnum;
END//


-- ---------------------------------------------
-- COURSE PROCEDURES
-- ---------------------------------------------

-- Create a new course (admin)
DROP PROCEDURE IF EXISTS createCourse//
CREATE PROCEDURE createCourse(
  IN p_code VARCHAR(20),
  IN p_name VARCHAR(150),
  IN p_description TEXT,
  IN p_units INT,
  IN p_max_students INT
)
BEGIN
  INSERT INTO bscs3a_admin.tbl_courses (fld_course_code, fld_course_name, fld_description, fld_units, fld_max_students)
  VALUES (p_code, p_name, p_description, p_units, p_max_students);

  SELECT * FROM bscs3a_admin.tbl_courses WHERE fld_course_id = LAST_INSERT_ID();
END//

-- Get all active courses
DROP PROCEDURE IF EXISTS getCourses//
CREATE PROCEDURE getCourses()
BEGIN
  SELECT c.*,
    (SELECT COUNT(*) FROM bscs3a_students.tbl_enrollments e
     WHERE e.fld_course_id = c.fld_course_id AND e.fld_status = 'enrolled') AS enrolled_count
  FROM bscs3a_admin.tbl_courses c
  WHERE c.fld_is_active = 1
  ORDER BY c.fld_course_code;
END//

-- Get course by ID
DROP PROCEDURE IF EXISTS getCourseById//
CREATE PROCEDURE getCourseById(
  IN p_course_id INT
)
BEGIN
  SELECT c.*,
    (SELECT COUNT(*) FROM bscs3a_students.tbl_enrollments e
     WHERE e.fld_course_id = c.fld_course_id AND e.fld_status = 'enrolled') AS enrolled_count
  FROM bscs3a_admin.tbl_courses c
  WHERE c.fld_course_id = p_course_id;
END//

-- Update course (admin)
DROP PROCEDURE IF EXISTS updateCourse//
CREATE PROCEDURE updateCourse(
  IN p_course_id INT,
  IN p_code VARCHAR(20),
  IN p_name VARCHAR(150),
  IN p_description TEXT,
  IN p_units INT,
  IN p_max_students INT
)
BEGIN
  UPDATE bscs3a_admin.tbl_courses
  SET fld_course_code = p_code,
      fld_course_name = p_name,
      fld_description = p_description,
      fld_units = p_units,
      fld_max_students = p_max_students
  WHERE fld_course_id = p_course_id;

  SELECT * FROM bscs3a_admin.tbl_courses WHERE fld_course_id = p_course_id;
END//


-- ---------------------------------------------
-- ENROLLMENT PROCEDURES
-- ---------------------------------------------

-- Enroll a student in a course
DROP PROCEDURE IF EXISTS enrollStudent//
CREATE PROCEDURE enrollStudent(
  IN p_studnum VARCHAR(10),
  IN p_course_id INT
)
BEGIN
  DECLARE v_max INT;
  DECLARE v_current INT;
  DECLARE v_exists INT;

  -- Check if already enrolled
  SELECT COUNT(*) INTO v_exists
  FROM bscs3a_students.tbl_enrollments
  WHERE fld_studnum = p_studnum AND fld_course_id = p_course_id AND fld_status = 'enrolled';

  IF v_exists > 0 THEN
    SIGNAL SQLSTATE '45000' SET MESSAGE_TEXT = 'Student is already enrolled in this course';
  END IF;

  -- Check course capacity
  SELECT fld_max_students INTO v_max
  FROM bscs3a_admin.tbl_courses
  WHERE fld_course_id = p_course_id AND fld_is_active = 1;

  IF v_max IS NULL THEN
    SIGNAL SQLSTATE '45000' SET MESSAGE_TEXT = 'Course not found or inactive';
  END IF;

  SELECT COUNT(*) INTO v_current
  FROM bscs3a_students.tbl_enrollments
  WHERE fld_course_id = p_course_id AND fld_status = 'enrolled';

  IF v_current >= v_max THEN
    SIGNAL SQLSTATE '45000' SET MESSAGE_TEXT = 'Course is already full';
  END IF;

  -- Enroll the student
  INSERT INTO bscs3a_students.tbl_enrollments (fld_studnum, fld_course_id, fld_status)
  VALUES (p_studnum, p_course_id, 'enrolled');

  SELECT e.*, c.fld_course_code, c.fld_course_name
  FROM bscs3a_students.tbl_enrollments e
  JOIN bscs3a_admin.tbl_courses c ON e.fld_course_id = c.fld_course_id
  WHERE e.fld_enrollment_id = LAST_INSERT_ID();
END//

-- Get enrollments by student
DROP PROCEDURE IF EXISTS getEnrollmentsByStudent//
CREATE PROCEDURE getEnrollmentsByStudent(
  IN p_studnum VARCHAR(10)
)
BEGIN
  SELECT e.fld_enrollment_id, e.fld_studnum, e.fld_enrollment_date, e.fld_status, e.fld_remarks,
         c.fld_course_id, c.fld_course_code, c.fld_course_name, c.fld_description, c.fld_units
  FROM bscs3a_students.tbl_enrollments e
  JOIN bscs3a_admin.tbl_courses c ON e.fld_course_id = c.fld_course_id
  WHERE e.fld_studnum = p_studnum
  ORDER BY e.fld_enrollment_date DESC;
END//


-- ---------------------------------------------
-- ADMIN & REPORTING PROCEDURES
-- ---------------------------------------------

-- Get all students (admin)
DROP PROCEDURE IF EXISTS getAllStudents//
CREATE PROCEDURE getAllStudents()
BEGIN
  SELECT a.fld_studnum, a.fld_username, a.fld_role, a.fld_hasaccess,
         i.fld_fname, i.fld_mname, i.fld_lname, i.fld_extname,
         i.fld_dob, i.fld_sex, i.fld_cvistatus, i.fld_isdeleted, i.fld_timestamp
  FROM bscs3a_accounts.tbl_accounts a
  LEFT JOIN bscs3a_students.tbl_information i ON a.fld_studnum = i.fld_studnum
  WHERE a.fld_role = 0
  ORDER BY i.fld_lname, i.fld_fname;
END//

-- Get all courses (admin) - includes inactive and enrollment counts
DROP PROCEDURE IF EXISTS getAllCoursesAdmin//
CREATE PROCEDURE getAllCoursesAdmin()
BEGIN
  SELECT c.*,
    (SELECT COUNT(*) FROM bscs3a_students.tbl_enrollments e
     WHERE e.fld_course_id = c.fld_course_id AND e.fld_status = 'enrolled') AS enrolled_count,
    (SELECT COUNT(*) FROM bscs3a_students.tbl_enrollments e
     WHERE e.fld_course_id = c.fld_course_id AND e.fld_status = 'dropped') AS dropped_count,
    (SELECT COUNT(*) FROM bscs3a_students.tbl_enrollments e
     WHERE e.fld_course_id = c.fld_course_id AND e.fld_status = 'completed') AS completed_count
  FROM bscs3a_admin.tbl_courses c
  ORDER BY c.fld_course_code;
END//

-- Enrollment report: full list with student + course details
DROP PROCEDURE IF EXISTS getEnrollmentReport//
CREATE PROCEDURE getEnrollmentReport()
BEGIN
  SELECT e.fld_enrollment_id, e.fld_enrollment_date, e.fld_status, e.fld_remarks,
         a.fld_studnum, i.fld_fname, i.fld_lname,
         c.fld_course_id, c.fld_course_code, c.fld_course_name, c.fld_units
  FROM bscs3a_students.tbl_enrollments e
  JOIN bscs3a_accounts.tbl_accounts a ON e.fld_studnum = a.fld_studnum
  JOIN bscs3a_students.tbl_information i ON a.fld_studnum = i.fld_studnum
  JOIN bscs3a_admin.tbl_courses c ON e.fld_course_id = c.fld_course_id
  ORDER BY e.fld_enrollment_date DESC;
END//

-- Course popularity report
DROP PROCEDURE IF EXISTS getCoursePopularity//
CREATE PROCEDURE getCoursePopularity()
BEGIN
  SELECT c.fld_course_id, c.fld_course_code, c.fld_course_name, c.fld_units, c.fld_max_students,
    COUNT(CASE WHEN e.fld_status = 'enrolled' THEN 1 END) AS enrolled_count,
    COUNT(CASE WHEN e.fld_status = 'dropped' THEN 1 END) AS dropped_count,
    COUNT(CASE WHEN e.fld_status = 'completed' THEN 1 END) AS completed_count,
    COUNT(e.fld_enrollment_id) AS total_enrollments,
    ROUND((COUNT(CASE WHEN e.fld_status = 'enrolled' THEN 1 END) / c.fld_max_students) * 100, 2) AS fill_rate_percent
  FROM bscs3a_admin.tbl_courses c
  LEFT JOIN bscs3a_students.tbl_enrollments e ON c.fld_course_id = e.fld_course_id
  WHERE c.fld_is_active = 1
  GROUP BY c.fld_course_id
  ORDER BY enrolled_count DESC;
END//

DELIMITER ;

-- ============================================================
-- Migration: Add Colleges and Programs tables
-- Run this script against your bscs3a_services database
-- ============================================================

USE bscs3a_services;

-- ─── Create tbl_colleges ───
CREATE TABLE IF NOT EXISTS tbl_colleges (
  fld_college_id INT AUTO_INCREMENT PRIMARY KEY,
  fld_college_code VARCHAR(20) NOT NULL UNIQUE,
  fld_college_name VARCHAR(150) NOT NULL,
  fld_is_active TINYINT(1) DEFAULT 1,
  fld_created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;

-- ─── Create tbl_programs ───
CREATE TABLE IF NOT EXISTS tbl_programs (
  fld_program_id INT AUTO_INCREMENT PRIMARY KEY,
  fld_college_id INT NOT NULL,
  fld_program_code VARCHAR(20) NOT NULL UNIQUE,
  fld_program_name VARCHAR(150) NOT NULL,
  fld_is_active TINYINT(1) DEFAULT 1,
  fld_created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  FOREIGN KEY (fld_college_id) REFERENCES tbl_colleges(fld_college_id) ON DELETE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;

-- ─── Add college/program columns to tbl_information ───
-- (These are safe to run even if columns already exist due to IF NOT EXISTS logic)

-- Check and add fld_college_id
SET @col_exists = (SELECT COUNT(*) FROM INFORMATION_SCHEMA.COLUMNS 
  WHERE TABLE_SCHEMA = 'bscs3a_services' 
  AND TABLE_NAME = 'tbl_information' 
  AND COLUMN_NAME = 'fld_college_id');

SET @sql = IF(@col_exists = 0, 
  'ALTER TABLE tbl_information ADD COLUMN fld_college_id INT NULL AFTER fld_sex',
  'SELECT 1');
PREPARE stmt FROM @sql;
EXECUTE stmt;
DEALLOCATE PREPARE stmt;

-- Check and add fld_program_id
SET @col_exists = (SELECT COUNT(*) FROM INFORMATION_SCHEMA.COLUMNS 
  WHERE TABLE_SCHEMA = 'bscs3a_services' 
  AND TABLE_NAME = 'tbl_information' 
  AND COLUMN_NAME = 'fld_program_id');

SET @sql = IF(@col_exists = 0, 
  'ALTER TABLE tbl_information ADD COLUMN fld_program_id INT NULL AFTER fld_college_id',
  'SELECT 1');
PREPARE stmt FROM @sql;
EXECUTE stmt;
DEALLOCATE PREPARE stmt;

-- ─── Seed sample colleges ───
INSERT IGNORE INTO tbl_colleges (fld_college_code, fld_college_name) VALUES
('CCS', 'College of Computer Studies'),
('COE', 'College of Engineering'),
('CBA', 'College of Business Administration'),
('CAS', 'College of Arts and Sciences'),
('CED', 'College of Education');

-- ─── Seed sample programs ───
INSERT IGNORE INTO tbl_programs (fld_college_id, fld_program_code, fld_program_name) VALUES
((SELECT fld_college_id FROM tbl_colleges WHERE fld_college_code = 'CCS'), 'BSCS', 'Bachelor of Science in Computer Science'),
((SELECT fld_college_id FROM tbl_colleges WHERE fld_college_code = 'CCS'), 'BSIT', 'Bachelor of Science in Information Technology'),
((SELECT fld_college_id FROM tbl_colleges WHERE fld_college_code = 'COE'), 'BSCE', 'Bachelor of Science in Civil Engineering'),
((SELECT fld_college_id FROM tbl_colleges WHERE fld_college_code = 'COE'), 'BSEE', 'Bachelor of Science in Electrical Engineering'),
((SELECT fld_college_id FROM tbl_colleges WHERE fld_college_code = 'CBA'), 'BSA', 'Bachelor of Science in Accountancy'),
((SELECT fld_college_id FROM tbl_colleges WHERE fld_college_code = 'CBA'), 'BSBA', 'Bachelor of Science in Business Administration'),
((SELECT fld_college_id FROM tbl_colleges WHERE fld_college_code = 'CAS'), 'AB', 'Bachelor of Arts'),
((SELECT fld_college_id FROM tbl_colleges WHERE fld_college_code = 'CED'), 'BSED', 'Bachelor of Secondary Education');

-- ─── Assign existing students to CCS / BSCS (since courses are BSCS-coded) ───
UPDATE tbl_information 
SET fld_college_id = (SELECT fld_college_id FROM tbl_colleges WHERE fld_college_code = 'CCS'),
    fld_program_id = (SELECT fld_program_id FROM tbl_programs WHERE fld_program_code = 'BSCS')
WHERE fld_college_id IS NULL;

-- ─── Done ───
SELECT 'Migration complete: tbl_colleges and tbl_programs created, students assigned.' AS result;

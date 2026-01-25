-- Add is_admin column to users table
ALTER TABLE users ADD COLUMN is_admin BOOLEAN DEFAULT FALSE;

-- Add password_hash column to users table
ALTER TABLE users ADD COLUMN password_hash TEXT;

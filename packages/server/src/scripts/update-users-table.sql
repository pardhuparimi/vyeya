-- Add grower profile fields to users table
ALTER TABLE users ADD COLUMN IF NOT EXISTS bio TEXT;
ALTER TABLE users ADD COLUMN IF NOT EXISTS phone VARCHAR(20);
ALTER TABLE users ADD COLUMN IF NOT EXISTS location VARCHAR(255);

-- Update existing user to be a grower for testing
UPDATE users SET role = 'grower', bio = 'Family-owned farm growing organic vegetables and fruits for our local community. Sustainable farming practices since 1995.', phone = '(555) 123-4567', location = 'Sunny Valley Farm, 5 miles north of downtown' WHERE email = 'grower@vyeya.com';
-- Update the role constraint to match the actual data in the database
-- First drop the existing constraint
ALTER TABLE users DROP CONSTRAINT users_role_check;

-- Add the new constraint with actual role values used in the application
ALTER TABLE users ADD CONSTRAINT users_role_check CHECK (role IN ('buyer', 'seller', 'grower', 'delivery', 'admin'));

-- Fix the created_by foreign key constraint issue
-- Run this in your Supabase SQL Editor

-- Drop the foreign key constraint on created_by
ALTER TABLE course_clos 
DROP CONSTRAINT IF EXISTS course_clos_created_by_fkey;

-- That's it! Now created_by is just a regular UUID field
-- It will still store the user ID, but won't enforce the foreign key


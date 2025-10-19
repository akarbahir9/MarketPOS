/*
# [Create Profiles for Username Login]
This migration creates the necessary 'profiles' table and a helper function to allow users to log in with a username instead of an email. It also secures the table with Row Level Security (RLS). This is a corrected and final version to resolve previous migration failures.

## Query Description: 
This operation is structural and safe. It adds a new table and a function, and does not modify or delete any existing data. It is essential for the username-based login feature.

## Metadata:
- Schema-Category: "Structural"
- Impact-Level: "Low"
- Requires-Backup: false
- Reversible: true (by dropping the table and function)

## Structure Details:
- Creates Table: `public.profiles`
- Creates Function: `public.get_user_email_from_username`
- Affects: Adds new database objects required for username authentication.

## Security Implications:
- RLS Status: Enabled on `public.profiles`.
- Policy Changes: Yes, adds policies to allow users to view profiles and manage their own.
- Auth Requirements: The function is required for the login process.
*/

-- Step 1: Create the 'profiles' table to store usernames
CREATE TABLE public.profiles (
    id uuid NOT NULL PRIMARY KEY,
    username TEXT NOT NULL,
    created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
    
    -- The user's ID from the 'auth.users' table
    CONSTRAINT profiles_id_fkey FOREIGN KEY (id) REFERENCES auth.users(id) ON DELETE CASCADE,
    
    -- Make sure every username is unique
    CONSTRAINT profiles_username_key UNIQUE (username),
    
    -- Add a check for username length and format
    CONSTRAINT username_validation CHECK (
      username ~ '^[a-zA-Z0-9_.]+$' AND -- Alphanumeric, underscore, dot
      char_length(username) >= 3 AND
      char_length(username) <= 50
    )
);

COMMENT ON TABLE public.profiles IS 'Stores public profile information for each user, including their unique username.';
COMMENT ON COLUMN public.profiles.id IS 'References the user''s ID from auth.users.';
COMMENT ON COLUMN public.profiles.username IS 'Unique public username for the user.';


-- Step 2: Enable Row Level Security on the new table
ALTER TABLE public.profiles ENABLE ROW LEVEL SECURITY;


-- Step 3: Create RLS policies for the 'profiles' table
-- Policy 1: Allow authenticated users to read all profiles.
-- This is needed for the login function to find the user by username.
CREATE POLICY "Public profiles are viewable by authenticated users."
ON public.profiles FOR SELECT
TO authenticated
USING (true);

-- Policy 2: Allow users to insert their own profile.
-- This is needed for the manual creation step by the admin.
CREATE POLICY "Users can insert their own profile."
ON public.profiles FOR INSERT
TO authenticated
WITH CHECK (auth.uid() = id);

-- Policy 3: Allow users to update their own profile.
CREATE POLICY "Users can update their own profile."
ON public.profiles FOR UPDATE
TO authenticated
USING (auth.uid() = id)
WITH CHECK (auth.uid() = id);


-- Step 4: Create the function to get a user's email from their username
-- This is called by the application during the login process.
CREATE OR REPLACE FUNCTION public.get_user_email_from_username(p_username TEXT)
RETURNS TEXT
LANGUAGE plpgsql
-- SECURITY DEFINER is required to query auth.users from within a function
SECURITY DEFINER
-- Explicitly set the search path to be secure
SET search_path = public
AS $$
DECLARE
  v_email TEXT;
BEGIN
  SELECT u.email INTO v_email
  FROM auth.users u
  JOIN public.profiles p ON u.id = p.id
  WHERE p.username = p_username;
  
  RETURN v_email;
END;
$$;

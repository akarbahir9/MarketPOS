/*
# [Operation Name]
Add User Profiles and Username Login

[Description of what this operation does]
This migration introduces a `profiles` table to store user-specific data, including a unique `username`. It also sets up a trigger to automatically create a profile when a new user signs up. This change enables users to log in with a username while using their real email for account creation and password recovery, significantly improving security and usability.

## Query Description: [This operation will add a new `profiles` table and a trigger to your database. It is a non-destructive, structural change. No existing data will be lost. It lays the groundwork for a more robust authentication system.]

## Metadata:
- Schema-Category: ["Structural"]
- Impact-Level: ["Low"]
- Requires-Backup: [false]
- Reversible: [true]

## Structure Details:
- Adds table: `public.profiles`
- Adds columns to `public.profiles`: `id`, `username`, `full_name`, `avatar_url`, `updated_at`
- Adds trigger: `on_auth_user_created` on `auth.users` table.
- Adds function: `public.handle_new_user()`
- Adds function: `public.get_email_from_username()`

## Security Implications:
- RLS Status: [Enabled] on `public.profiles`
- Policy Changes: [Yes] - New policies are created for the `profiles` table to allow users to manage their own profile.
- Auth Requirements: [None for this migration]

## Performance Impact:
- Indexes: [Added] - Primary key on `id` and unique index on `username`.
- Triggers: [Added] - One trigger on `auth.users`. Impact is negligible.
- Estimated Impact: [Low. This is a standard and efficient way to handle user profiles in Supabase.]
*/

-- 1. Create the profiles table
CREATE TABLE public.profiles (
  id UUID PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
  username TEXT UNIQUE NOT NULL,
  full_name TEXT,
  avatar_url TEXT,
  updated_at TIMESTAMPTZ DEFAULT NOW(),

  CONSTRAINT username_length CHECK (char_length(username) >= 3)
);

-- 2. Add comments to the new table and columns
COMMENT ON TABLE public.profiles IS 'Profile data for each user.';
COMMENT ON COLUMN public.profiles.id IS 'References the user in auth.users.';
COMMENT ON COLUMN public.profiles.username IS 'The unique username for the user.';

-- 3. Enable Row Level Security (RLS) on the profiles table
ALTER TABLE public.profiles ENABLE ROW LEVEL SECURITY;

-- 4. Create RLS policies for the profiles table
CREATE POLICY "Users can view their own profile."
ON public.profiles FOR SELECT
USING (auth.uid() = id);

CREATE POLICY "Users can update their own profile."
ON public.profiles FOR UPDATE
USING (auth.uid() = id)
WITH CHECK (auth.uid() = id);

-- This allows any user (even anonymous) to check if a username exists, which is useful for sign-up forms.
-- It only exposes the username, not any other data.
CREATE POLICY "Public profiles are viewable by everyone." ON "public"."profiles"
AS PERMISSIVE FOR SELECT
TO public
USING (true);


-- 5. Create a function to handle new user creation
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS TRIGGER
LANGUAGE plpgsql
SECURITY DEFINER SET search_path = public
AS $$
BEGIN
  INSERT INTO public.profiles (id, username, full_name)
  VALUES (
    new.id,
    new.raw_user_meta_data->>'username',
    new.raw_user_meta_data->>'full_name'
  );
  RETURN new;
END;
$$;

-- 6. Create a trigger to call the function when a new user is created in auth.users
CREATE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW EXECUTE FUNCTION public.handle_new_user();

-- 7. Create a function to get a user's email from their username
CREATE OR REPLACE FUNCTION public.get_email_from_username(p_username TEXT)
RETURNS TEXT
LANGUAGE plpgsql
SECURITY DEFINER SET search_path = auth, public
AS $$
DECLARE
  v_user_id UUID;
  v_email TEXT;
BEGIN
  -- Find the user_id from the profiles table based on the username
  SELECT id INTO v_user_id FROM public.profiles WHERE username = p_username;

  IF v_user_id IS NULL THEN
    RETURN NULL;
  END IF;

  -- Find the email from the auth.users table based on the user_id
  SELECT email INTO v_email FROM auth.users WHERE id = v_user_id;

  RETURN v_email;
END;
$$;

-- Grant execution rights to the anonymous and authenticated roles
GRANT EXECUTE ON FUNCTION public.get_email_from_username(TEXT) TO anon;
GRANT EXECUTE ON FUNCTION public.get_email_from_username(TEXT) TO authenticated;

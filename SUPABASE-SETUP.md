# Supabase Setup Instructions

This document provides step-by-step instructions for setting up your Supabase database for the chat application.

## 1. Environment Variables

The application is already configured with your Supabase credentials in the `.env.local` file:

```
NEXT_PUBLIC_SUPABASE_URL=https://uwbybesqencvbwgjpzwa.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InV3YnliZXNxZW5jdmJ3Z2pwendhIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NDU0OTg1NDUsImV4cCI6MjA2MTA3NDU0NX0.4i5EmgvTvj1biz_8cWBs-tN_juBq08iLo5oiNxkSDy8
```

## 2. Database Setup

To set up the database tables, follow these steps:

1. Log in to your Supabase dashboard at [https://app.supabase.com](https://app.supabase.com)
2. Select your project
3. Go to the SQL Editor
4. Copy the contents of the `supabase-setup.sql` file
5. Paste the SQL into the editor and run it

## 3. Authentication Setup

To enable email/password authentication:

1. In your Supabase dashboard, go to Authentication > Providers
2. Enable Email provider
3. Configure the following settings:
   - Enable "Confirm email" if you want users to verify their email addresses
   - Set "Secure email change" to true
   - Set "Secure password change" to true

## 4. Row Level Security (RLS)

For better security, you should set up Row Level Security policies:

1. Go to Authentication > Policies
2. For the `default_profiles` table, add a policy that allows users to read and update only their own profile:

```sql
-- Allow users to read their own profile
CREATE POLICY "Users can read their own profile"
ON default_profiles FOR SELECT
USING (auth.uid() = id);

-- Allow users to update their own profile
CREATE POLICY "Users can update their own profile"
ON default_profiles FOR UPDATE
USING (auth.uid() = id);
```

3. For the `default_messages` table, add policies that allow users to read messages in chats they're part of and insert their own messages:

```sql
-- Allow users to read messages in chats they're part of
CREATE POLICY "Users can read messages in their chats"
ON default_messages FOR SELECT
USING (true);

-- Allow users to insert their own messages
CREATE POLICY "Users can insert their own messages"
ON default_messages FOR INSERT
WITH CHECK (auth.uid() = user_id);
```

## 5. Testing the Connection

To test if your Supabase connection is working:

1. Start the development server:
   ```
   npm run dev
   ```

2. Open the application in your browser at [http://localhost:3000](http://localhost:3000)
3. Try to sign up with a new account
4. If successful, you should be redirected to the chat page

## Troubleshooting

If you encounter any issues:

1. Check the browser console for errors
2. Verify that your Supabase credentials are correct
3. Make sure all the required tables are created
4. Check that the authentication provider is enabled 
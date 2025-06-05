const { createClient } = require('@supabase/supabase-js');

// Supabase credentials
const supabaseUrl = 'https://uwbybesqencvbwgjpzwa.supabase.co';
const supabaseAnonKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InV3YnliZXNxZW5jdmJ3Z2pwendhIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NDU0OTg1NDUsImV4cCI6MjA2MTA3NDU0NX0.4i5EmgvTvj1biz_8cWBs-tN_juBq08iLo5oiNxkSDy8';

// Create Supabase client
const supabase = createClient(supabaseUrl, supabaseAnonKey);

// SQL statements to create tables
const createTablesSQL = `
-- Enable UUID extension if not already enabled
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- Create profiles table
CREATE TABLE IF NOT EXISTS default_profiles (
  id UUID PRIMARY KEY REFERENCES auth.users(id),
  name TEXT,
  email TEXT,
  company TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Create chats table
CREATE TABLE IF NOT EXISTS default_chats (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  name TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Create messages table
CREATE TABLE IF NOT EXISTS default_messages (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  chat_id UUID NOT NULL,
  user_id UUID NOT NULL REFERENCES auth.users(id),
  content TEXT NOT NULL,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Create a demo chat with a proper UUID
INSERT INTO default_chats (id, name)
VALUES (uuid_generate_v4(), 'Demo Chat')
ON CONFLICT (id) DO NOTHING;
`;

async function setupDatabase() {
  try {
    console.log('Setting up database tables...');
    
    // Execute SQL statements
    const { error } = await supabase.rpc('exec_sql', { sql: createTablesSQL });
    
    if (error) {
      console.error('❌ Error setting up database:', error.message);
      console.log('\nPlease run the following SQL in the Supabase SQL Editor:');
      console.log(createTablesSQL);
    } else {
      console.log('✅ Database tables created successfully!');
    }
  } catch (error) {
    console.error('❌ Error:', error.message);
    console.log('\nPlease run the following SQL in the Supabase SQL Editor:');
    console.log(createTablesSQL);
  }
}

setupDatabase(); 
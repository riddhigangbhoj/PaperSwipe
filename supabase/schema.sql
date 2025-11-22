-- PaperSwipe Database Schema for Supabase
-- Run this in Supabase SQL Editor (Database → SQL Editor)

-- 1. Create profiles table (extends Supabase auth.users)
CREATE TABLE IF NOT EXISTS profiles (
  id UUID REFERENCES auth.users(id) ON DELETE CASCADE PRIMARY KEY,
  email TEXT,
  full_name TEXT,
  bio TEXT,
  research_interests TEXT[],
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- 2. Create saved_papers table
CREATE TABLE IF NOT EXISTS saved_papers (
  id BIGSERIAL PRIMARY KEY,
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL,
  arxiv_id TEXT NOT NULL,
  title TEXT NOT NULL,
  authors TEXT[] NOT NULL,
  abstract TEXT,
  categories TEXT[],
  published_date DATE,
  pdf_url TEXT,
  source_url TEXT,
  notes TEXT,
  is_public BOOLEAN DEFAULT false,
  saved_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW(),

  -- Prevent duplicate saves
  UNIQUE(user_id, arxiv_id)
);

-- 3. Create tags table
CREATE TABLE IF NOT EXISTS tags (
  id BIGSERIAL PRIMARY KEY,
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL,
  name TEXT NOT NULL,
  color TEXT DEFAULT '#9333EA',
  created_at TIMESTAMPTZ DEFAULT NOW(),

  -- Each user can only have one tag with a given name
  UNIQUE(user_id, name)
);

-- 4. Create saved_paper_tags junction table (many-to-many)
CREATE TABLE IF NOT EXISTS saved_paper_tags (
  saved_paper_id BIGINT REFERENCES saved_papers(id) ON DELETE CASCADE,
  tag_id BIGINT REFERENCES tags(id) ON DELETE CASCADE,
  PRIMARY KEY (saved_paper_id, tag_id)
);

-- 5. Enable Row Level Security (RLS)
ALTER TABLE profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE saved_papers ENABLE ROW LEVEL SECURITY;
ALTER TABLE tags ENABLE ROW LEVEL SECURITY;
ALTER TABLE saved_paper_tags ENABLE ROW LEVEL SECURITY;

-- 6. RLS Policies for profiles
CREATE POLICY "Users can view their own profile"
  ON profiles FOR SELECT
  USING (auth.uid() = id);

CREATE POLICY "Users can update their own profile"
  ON profiles FOR UPDATE
  USING (auth.uid() = id);

CREATE POLICY "Users can insert their own profile"
  ON profiles FOR INSERT
  WITH CHECK (auth.uid() = id);

-- 7. RLS Policies for saved_papers
CREATE POLICY "Users can view their own saved papers"
  ON saved_papers FOR SELECT
  USING (auth.uid() = user_id);

CREATE POLICY "Users can insert their own saved papers"
  ON saved_papers FOR INSERT
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update their own saved papers"
  ON saved_papers FOR UPDATE
  USING (auth.uid() = user_id);

CREATE POLICY "Users can delete their own saved papers"
  ON saved_papers FOR DELETE
  USING (auth.uid() = user_id);

-- 8. RLS Policies for tags
CREATE POLICY "Users can view their own tags"
  ON tags FOR SELECT
  USING (auth.uid() = user_id);

CREATE POLICY "Users can insert their own tags"
  ON tags FOR INSERT
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can delete their own tags"
  ON tags FOR DELETE
  USING (auth.uid() = user_id);

-- 9. RLS Policies for saved_paper_tags
CREATE POLICY "Users can manage their paper tags"
  ON saved_paper_tags FOR ALL
  USING (
    EXISTS (
      SELECT 1 FROM saved_papers
      WHERE saved_papers.id = saved_paper_id
      AND saved_papers.user_id = auth.uid()
    )
  );

-- 10. Create function to auto-create profile on signup
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS TRIGGER AS $$
BEGIN
  INSERT INTO public.profiles (id, email, full_name)
  VALUES (
    NEW.id,
    NEW.email,
    COALESCE(NEW.raw_user_meta_data->>'full_name', '')
  );
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- 11. Create trigger to call function on signup
DROP TRIGGER IF EXISTS on_auth_user_created ON auth.users;
CREATE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW EXECUTE FUNCTION public.handle_new_user();

-- 12. Create indexes for better performance
CREATE INDEX IF NOT EXISTS idx_saved_papers_user_id ON saved_papers(user_id);
CREATE INDEX IF NOT EXISTS idx_saved_papers_arxiv_id ON saved_papers(arxiv_id);
CREATE INDEX IF NOT EXISTS idx_tags_user_id ON tags(user_id);

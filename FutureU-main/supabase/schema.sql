-- 创建用户资料表
CREATE TABLE IF NOT EXISTS profiles (
  id UUID REFERENCES auth.users ON DELETE CASCADE PRIMARY KEY,
  name TEXT NOT NULL,
  education TEXT,
  career_goal TEXT,
  resume_url TEXT,
  linkedin_url TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- 创建简历分析结果表
CREATE TABLE IF NOT EXISTS resume_analysis (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID REFERENCES profiles(id) ON DELETE CASCADE NOT NULL,
  resume_url TEXT NOT NULL,
  strengths JSONB,
  gaps JSONB,
  recommended_projects JSONB,
  skills_radar JSONB,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- 创建项目进度表
CREATE TABLE IF NOT EXISTS project_progress (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID REFERENCES profiles(id) ON DELETE CASCADE NOT NULL,
  project_id TEXT NOT NULL,
  status TEXT NOT NULL DEFAULT 'not_started', -- not_started, in_progress, completed
  progress INTEGER DEFAULT 0,
  deliverables JSONB,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- 创建职位推荐表
CREATE TABLE IF NOT EXISTS job_recommendations (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID REFERENCES profiles(id) ON DELETE CASCADE NOT NULL,
  company TEXT NOT NULL,
  position TEXT NOT NULL,
  location TEXT,
  salary TEXT,
  match_score INTEGER,
  match_reason TEXT,
  tags JSONB,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- 创建RLS策略
-- 用户只能查看和修改自己的资料
CREATE POLICY "Users can view own profile" 
  ON profiles FOR SELECT 
  USING (auth.uid() = id);

CREATE POLICY "Users can update own profile" 
  ON profiles FOR UPDATE 
  USING (auth.uid() = id);

CREATE POLICY "Users can insert own profile"
  ON profiles FOR INSERT
  WITH CHECK (auth.uid() = id);

-- 用户只能查看自己的简历分析结果
CREATE POLICY "Users can view own resume analysis" 
  ON resume_analysis FOR SELECT 
  USING (auth.uid() = user_id);

-- 用户只能查看和更新自己的项目进度
CREATE POLICY "Users can view own project progress" 
  ON project_progress FOR SELECT 
  USING (auth.uid() = user_id);

CREATE POLICY "Users can update own project progress" 
  ON project_progress FOR UPDATE 
  USING (auth.uid() = user_id);

-- 用户只能查看自己的职位推荐
CREATE POLICY "Users can view own job recommendations" 
  ON job_recommendations FOR SELECT 
  USING (auth.uid() = user_id);

-- 启用RLS
ALTER TABLE profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE resume_analysis ENABLE ROW LEVEL SECURITY;
ALTER TABLE project_progress ENABLE ROW LEVEL SECURITY;
ALTER TABLE job_recommendations ENABLE ROW LEVEL SECURITY;

-- 创建存储桶策略
-- 创建一个触发器，在用户注册时自动创建profile记录
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS TRIGGER AS $$
BEGIN
  INSERT INTO public.profiles (id, name, education, career_goal)
  VALUES (
    NEW.id,
    COALESCE(NEW.raw_user_meta_data->>'full_name', NEW.raw_user_meta_data->>'name', 'User'),
    COALESCE(NEW.raw_user_meta_data->>'education', ''),
    COALESCE(NEW.raw_user_meta_data->>'career_goal', '')
  );
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- 触发器：当新用户注册时创建profile
CREATE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW EXECUTE PROCEDURE public.handle_new_user();
// lib/supabase/types.ts
export type Profile = {
  id: string
  name: string
  full_name?: string // 前端使用的字段，映射到数据库中的 name 字段
  education: string | null
  career_goal: string | null
  resume_url: string | null
  linkedin_url: string | null
  created_at: string
  updated_at: string
  email?: string // 用于前端显示，不存储在 profiles 表中
}

export type ResumeAnalysis = {
  id: string
  user_id: string
  resume_url: string
  strengths: {
    title: string
    desc: string
    icon?: string
  }[]
  gaps: string[]
  recommended_projects: {
    id: string
    title: string
    brief: string
  }[]
  skills_radar: {
    dimension: string
    current: number
    target: number
  }[]
  created_at: string
}

export type ProjectProgress = {
  id: string
  user_id: string
  project_id: string
  status: 'not_started' | 'in_progress' | 'completed'
  progress: number
  deliverables: {
    id: string
    title: string
    completed: boolean
    url?: string
  }[]
  created_at: string
  updated_at: string
}

export type JobRecommendation = {
  id: string
  user_id: string
  company: string
  position: string
  location: string | null
  salary: string | null
  match_score: number
  match_reason: string | null
  tags: string[]
  created_at: string
}

// 数据库表类型定义
export type Database = {
  public: {
    Tables: {
      profiles: {
        Row: Profile
        Insert: Omit<Profile, 'created_at' | 'updated_at'>
        Update: Partial<Omit<Profile, 'id' | 'created_at' | 'updated_at'>>
      }
      resume_analysis: {
        Row: ResumeAnalysis
        Insert: Omit<ResumeAnalysis, 'id' | 'created_at'>
        Update: Partial<Omit<ResumeAnalysis, 'id' | 'user_id' | 'created_at'>>
      }
      project_progress: {
        Row: ProjectProgress
        Insert: Omit<ProjectProgress, 'id' | 'created_at' | 'updated_at'>
        Update: Partial<Omit<ProjectProgress, 'id' | 'user_id' | 'created_at' | 'updated_at'>>
      }
      job_recommendations: {
        Row: JobRecommendation
        Insert: Omit<JobRecommendation, 'id' | 'created_at'>
        Update: Partial<Omit<JobRecommendation, 'id' | 'user_id' | 'created_at'>>
      }
    }
  }
}
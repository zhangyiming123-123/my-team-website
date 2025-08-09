// lib/supabase/hooks.ts
import { useEffect, useState } from 'react'
import { useRouter } from 'next/navigation'
import { useUserStore } from '@/store/user-store'
import { getSupabaseClient, getCurrentUserId } from './client'
import { Profile, ResumeAnalysis, ProjectProgress, JobRecommendation } from './types'

// 获取用户资料钩子
export function useProfile() {
  const [profile, setProfile] = useState<Profile | null>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<Error | null>(null)
  const { user } = useUserStore()
  const supabase = getSupabaseClient()

  useEffect(() => {
    async function fetchProfile() {
      if (!user?.id) return

      try {
        setLoading(true)
        const { data, error } = await supabase
          .from('profiles')
          .select('*')
          .eq('id', user.id)
          .single()

        if (error) throw error
        setProfile(data)
      } catch (err: any) {
        console.error('获取用户资料失败:', err)
        setError(err)
      } finally {
        setLoading(false)
      }
    }

    fetchProfile()
  }, [user?.id, supabase])

  return { profile, loading, error }
}

// 获取简历分析结果钩子
export function useResumeAnalysis() {
  const [analysis, setAnalysis] = useState<ResumeAnalysis | null>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<Error | null>(null)
  const { user } = useUserStore()
  const supabase = getSupabaseClient()

  useEffect(() => {
    async function fetchAnalysis() {
      if (!user?.id) return

      try {
        setLoading(true)
        const { data, error } = await supabase
          .from('resume_analysis')
          .select('*')
          .eq('user_id', user.id)
          .order('created_at', { ascending: false })
          .limit(1)
          .single()

        if (error && error.code !== 'PGRST116') throw error // PGRST116 是没有找到记录的错误
        setAnalysis(data || null)
      } catch (err: any) {
        console.error('获取简历分析失败:', err)
        setError(err)
      } finally {
        setLoading(false)
      }
    }

    fetchAnalysis()
  }, [user?.id, supabase])

  return { analysis, loading, error }
}

// 获取项目进度钩子
export function useProjectProgress(projectId?: string) {
  const [progress, setProgress] = useState<ProjectProgress | null>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<Error | null>(null)
  const { user } = useUserStore()
  const supabase = getSupabaseClient()

  useEffect(() => {
    async function fetchProgress() {
      if (!user?.id || !projectId) return

      try {
        setLoading(true)
        const { data, error } = await supabase
          .from('project_progress')
          .select('*')
          .eq('user_id', user.id)
          .eq('project_id', projectId)
          .single()

        if (error && error.code !== 'PGRST116') throw error
        setProgress(data || null)
      } catch (err: any) {
        console.error('获取项目进度失败:', err)
        setError(err)
      } finally {
        setLoading(false)
      }
    }

    fetchProgress()
  }, [user?.id, projectId, supabase])

  return { progress, loading, error }
}

// 获取职位推荐钩子
export function useJobRecommendations() {
  const [recommendations, setRecommendations] = useState<JobRecommendation[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<Error | null>(null)
  const { user } = useUserStore()
  const supabase = getSupabaseClient()

  useEffect(() => {
    async function fetchRecommendations() {
      if (!user?.id) return

      try {
        setLoading(true)
        const { data, error } = await supabase
          .from('job_recommendations')
          .select('*')
          .eq('user_id', user.id)
          .order('match_score', { ascending: false })

        if (error) throw error
        setRecommendations(data || [])
      } catch (err: any) {
        console.error('获取职位推荐失败:', err)
        setError(err)
      } finally {
        setLoading(false)
      }
    }

    fetchRecommendations()
  }, [user?.id, supabase])

  return { recommendations, loading, error }
}

// 检查用户会话钩子
export function useCheckSession() {
  const router = useRouter()
  const { user, login, logout } = useUserStore()
  const [loading, setLoading] = useState(true)
  const supabase = getSupabaseClient()

  useEffect(() => {
    const checkUserSession = async () => {
      try {
        setLoading(true)
        const { data: { session }, error } = await supabase.auth.getSession()
        
        if (error || !session) {
          logout()
          router.replace('/')
          return
        }

        // 如果 Zustand 中没有用户数据，则从 Supabase 获取并更新
        if (!user || user.id !== session.user.id) {
          const { data: profileData, error: profileError } = await supabase
            .from('profiles')
            .select('*')
            .eq('id', session.user.id)
            .single()

          if (profileError) {
            console.error("获取用户资料失败:", profileError)
            logout()
            router.replace("/")
            return
          }

          login({
            id: session.user.id,
            name: profileData.name,
            email: session.user.email!,
            education: profileData.education,
            careerGoal: profileData.career_goal,
            resumeUrl: profileData.resume_url,
          })
        }
      } catch (err) {
        console.error("会话检查失败:", err)
        logout()
        router.replace("/")
      } finally {
        setLoading(false)
      }
    }

    checkUserSession()

    // 监听认证状态变化
    const { data: authListener } = supabase.auth.onAuthStateChange((_event, session) => {
      if (!session) {
        logout()
        router.replace("/")
      }
    })

    return () => {
      authListener.subscription.unsubscribe()
    }
  }, [router, supabase, user, login, logout])

  return { loading }
}
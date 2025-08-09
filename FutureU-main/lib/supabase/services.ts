// lib/supabase/services.ts
import { getSupabaseClient, getCurrentUserId } from './client'
import { Profile, ResumeAnalysis, ProjectProgress, JobRecommendation } from './types'

// 用户资料服务
export const profileService = {
  // 获取当前用户资料
  async getCurrentProfile(): Promise<Profile | null> {
    const userId = await getCurrentUserId()
    if (!userId) return null
    
    const supabase = getSupabaseClient()
    let { data, error } = await supabase
      .from('profiles')
      .select('*')
      .eq('id', userId)
      .single()
    
    if (error || !data) {
      console.log('用户资料不存在，正在创建...')
      // 创建默认资料
      const defaultProfile = {
        id: userId,
        name: '新用户',
        education: '',
        career_goal: '',
        resume_url: null,
        linkedin_url: null
      }
      
      const { data: insertData, error: insertError } = await supabase
        .from('profiles')
        .insert(defaultProfile)
        .select()
        .single()
      
      if (insertError) {
        console.error('创建用户资料失败:', insertError)
        return null
      }
      data = insertData
    }
    
    // 确保字段名映射正确
    if (data) {
      // 将数据库中的 name 字段映射到前端使用的 full_name 字段
      data.full_name = data.name;
      
      // 获取用户邮箱
      try {
        const { data: userData } = await supabase.auth.getUser();
        if (userData && userData.user) {
          data.email = userData.user.email || '';
        }
      } catch (err) {
        console.error('获取用户邮箱失败:', err);
      }
    }
    
    return data
  },
  
  // 更新用户资料
  async updateProfile(profile: Partial<Omit<Profile, 'id' | 'created_at' | 'updated_at'>>): Promise<boolean> {
    const userId = await getCurrentUserId()
    if (!userId) return false
    
    // 确保字段名与数据库表字段匹配
    const mappedProfile: any = {}
    if (profile.full_name) mappedProfile.name = profile.full_name
    if (profile.education) mappedProfile.education = profile.education
    if (profile.career_goal) mappedProfile.career_goal = profile.career_goal
    if (profile.resume_url) mappedProfile.resume_url = profile.resume_url
    if (profile.linkedin_url) mappedProfile.linkedin_url = profile.linkedin_url
    
    const supabase = getSupabaseClient()
    const { error } = await supabase
      .from('profiles')
      .update(mappedProfile)
      .eq('id', userId)
    
    if (error) {
      console.error('更新用户资料失败:', error)
      return false
    }
    
    return true
  },
}

// 简历服务
export const resumeService = {
  // 上传简历
  async uploadResume(file: File): Promise<{ url: string | null; error: string | null }> {
    const userId = await getCurrentUserId()
    if (!userId) return { url: null, error: '用户未登录' }
    
    const supabase = getSupabaseClient()
    const fileExt = file.name.split('.').pop()
    const filePath = `${userId}/${Date.now()}.${fileExt}`
    
    try {
      // 上传文件到存储
      const { error: uploadError } = await supabase.storage
        .from('resumes')
        .upload(filePath, file, {
          cacheControl: '3600',
          upsert: false,
        })
      
      if (uploadError) throw uploadError
      
      // 获取公开URL
      const { data: publicUrlData } = supabase.storage
        .from('resumes')
        .getPublicUrl(filePath)
      
      if (!publicUrlData || !publicUrlData.publicUrl) {
        throw new Error('无法获取文件公开链接')
      }
      
      // 更新用户资料中的简历URL
      const { error: updateError } = await supabase
        .from('profiles')
        .update({ resume_url: publicUrlData.publicUrl })
        .eq('id', userId)
      
      if (updateError) throw updateError
      
      return { url: publicUrlData.publicUrl, error: null }
    } catch (err: any) {
      console.error('简历上传失败:', err)
      return { url: null, error: err.message || '简历上传失败' }
    }
  },
  
  // 分析简历（模拟）
  async analyzeResume(resumeUrl: string): Promise<{ analysis: ResumeAnalysis | null; error: string | null }> {
    const userId = await getCurrentUserId()
    if (!userId) return { analysis: null, error: '用户未登录' }
    
    try {
      // 模拟分析过程
      await new Promise(resolve => setTimeout(resolve, 2000))
      
      // 创建模拟分析结果
      const mockAnalysis: Omit<ResumeAnalysis, 'id' | 'created_at'> = {
        user_id: userId,
        resume_url: resumeUrl,
        strengths: [
          { title: '系统性思维', desc: '具备结构化分析复杂问题的能力' },
          { title: '用户洞察', desc: '善于从访谈与数据中提炼可行动结论' },
          { title: '增长意识', desc: '理解漏斗与增长模型，关注关键指标' },
        ],
        gaps: ['SQL 与数据可视化', '算法基础与评估指标', '实验设计（如样本量、显著性）'],
        recommended_projects: [
          { id: 'resume-ai', title: '设计 AI 驱动的简历优化工具', brief: '围绕求职者简历质量评估与优化建议，设计端到端产品方案与原型。' },
          { id: 'abt-platform', title: '搭建 A/B 实验配置平台', brief: '为产品团队提供统一的实验配置、指标追踪与结果解读能力。' },
        ],
        skills_radar: [
          { dimension: '数据素养', current: 45, target: 85 },
          { dimension: '用户洞察', current: 60, target: 90 },
          { dimension: '跨职能协作', current: 55, target: 88 },
          { dimension: '需求分析', current: 62, target: 92 },
          { dimension: '产品策略', current: 40, target: 86 },
          { dimension: 'A/B 实验', current: 35, target: 80 },
        ],
      }
      
      // 保存分析结果到数据库
      const supabase = getSupabaseClient()
      const { data, error } = await supabase
        .from('resume_analysis')
        .insert(mockAnalysis)
        .select()
        .single()
      
      if (error) throw error
      
      // 同时生成职位推荐
      await jobService.generateRecommendations(userId)
      
      return { analysis: data, error: null }
    } catch (err: any) {
      console.error('简历分析失败:', err)
      return { analysis: null, error: err.message || '简历分析失败' }
    }
  },
}

// 项目服务
export const projectService = {
  // 开始一个项目
  async startProject(projectId: string): Promise<{ success: boolean; error: string | null }> {
    const userId = await getCurrentUserId()
    if (!userId) return { success: false, error: '用户未登录' }
    
    try {
      const supabase = getSupabaseClient()
      
      // 检查项目是否已存在
      const { data: existingProject } = await supabase
        .from('project_progress')
        .select('id')
        .eq('user_id', userId)
        .eq('project_id', projectId)
        .single()
      
      if (existingProject) {
        // 项目已存在，更新状态
        const { error } = await supabase
          .from('project_progress')
          .update({ status: 'in_progress', progress: 0 })
          .eq('id', existingProject.id)
        
        if (error) throw error
      } else {
        // 创建新项目
        const { error } = await supabase
          .from('project_progress')
          .insert({
            user_id: userId,
            project_id: projectId,
            status: 'in_progress',
            progress: 0,
            deliverables: [],
          })
        
        if (error) throw error
      }
      
      return { success: true, error: null }
    } catch (err: any) {
      console.error('开始项目失败:', err)
      return { success: false, error: err.message || '开始项目失败' }
    }
  },
  
  // 更新项目进度
  async updateProjectProgress(projectId: string, progress: number, deliverables?: any[]): Promise<{ success: boolean; error: string | null }> {
    const userId = await getCurrentUserId()
    if (!userId) return { success: false, error: '用户未登录' }
    
    try {
      const supabase = getSupabaseClient()
      
      // 查找项目
      const { data: project } = await supabase
        .from('project_progress')
        .select('id, deliverables')
        .eq('user_id', userId)
        .eq('project_id', projectId)
        .single()
      
      if (!project) {
        return { success: false, error: '项目不存在' }
      }
      
      // 准备更新数据
      const updateData: any = { progress }
      
      // 如果进度达到100%，更新状态为已完成
      if (progress >= 100) {
        updateData.status = 'completed'
      }
      
      // 如果提供了交付物，更新交付物
      if (deliverables) {
        updateData.deliverables = deliverables
      }
      
      // 更新项目
      const { error } = await supabase
        .from('project_progress')
        .update(updateData)
        .eq('id', project.id)
      
      if (error) throw error
      
      return { success: true, error: null }
    } catch (err: any) {
      console.error('更新项目进度失败:', err)
      return { success: false, error: err.message || '更新项目进度失败' }
    }
  },
}

// 职位推荐服务
export const jobService = {
  // 生成职位推荐（模拟）
  async generateRecommendations(userId: string): Promise<{ success: boolean; error: string | null }> {
    try {
      // 模拟生成过程
      await new Promise(resolve => setTimeout(resolve, 1000))
      
      // 创建模拟推荐
      const mockRecommendations = [
        {
          user_id: userId,
          company: '字节跳动',
          position: 'AI 用户行为分析产品经理',
          location: '北京',
          salary: '25-40K',
          match_score: 92,
          match_reason: '该岗位重视复杂系统逻辑，与你的工程背景高度契合。',
          tags: ['AI产品', '用户分析', 'B端产品'],
        },
        {
          user_id: userId,
          company: '腾讯',
          position: '智能推荐算法产品经理',
          location: '深圳',
          salary: '30-45K',
          match_score: 89,
          match_reason: '你的数据分析能力与推荐算法产品需求完美匹配。',
          tags: ['推荐算法', '数据产品', 'C端产品'],
        },
        {
          user_id: userId,
          company: '阿里巴巴',
          position: 'AI 商业化产品经理',
          location: '杭州',
          salary: '28-42K',
          match_score: 86,
          match_reason: '你的增长意识与商业化产品需求高度匹配。',
          tags: ['AI产品', '商业化', 'B端产品'],
        },
      ]
      
      // 保存推荐到数据库
      const supabase = getSupabaseClient()
      
      // 先删除旧的推荐
      await supabase
        .from('job_recommendations')
        .delete()
        .eq('user_id', userId)
      
      // 插入新的推荐
      const { error } = await supabase
        .from('job_recommendations')
        .insert(mockRecommendations)
      
      if (error) throw error
      
      return { success: true, error: null }
    } catch (err: any) {
      console.error('生成职位推荐失败:', err)
      return { success: false, error: err.message || '生成职位推荐失败' }
    }
  },
}
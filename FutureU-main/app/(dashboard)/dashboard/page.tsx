"use client"

import { useEffect, useMemo, useState } from "react"
import Link from "next/link"
import { useRouter } from "next/navigation"
import { useUserStore } from "@/store/user-store"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Progress } from "@/components/ui/progress"
import { Badge } from "@/components/ui/badge"
import { Upload, Link2, FileText, BrainCircuit, Sparkles, TrendingUp, Loader2, LogOut, CheckCircle } from 'lucide-react'
import {
  ChartContainer,
  ChartTooltip,
  ChartTooltipContent,
} from "@/components/ui/chart"
import {
  Radar,
  RadarChart,
  PolarAngleAxis,
  PolarGrid,
  PolarRadiusAxis,
  ResponsiveContainer,
} from "recharts"
import { getSupabaseClient } from "@/lib/supabase/client" // 导入 Supabase 客户端
import { resumeService, profileService } from "@/lib/supabase/services" // 导入服务

import { ResumeAnalysis } from "@/lib/supabase/types"

type AnalysisResult = {
  strengths: { title: string; desc: string; icon: React.ReactNode }[]
  gaps: string[]
  projects: { id: string; title: string; brief: string }[]
}

export default function DashboardPage() {
  const router = useRouter()
  const { user, login, logout } = useUserStore() // 引入 login 用于更新用户状态
  const [uploading, setUploading] = useState(false)
  const [analyzing, setAnalyzing] = useState(false)
  const [progress, setProgress] = useState(42) // 职业准备进度条
  const [linkedin, setLinkedin] = useState("")
  const [result, setResult] = useState<AnalysisResult | null>(null)
  const [uploadError, setUploadError] = useState<string | null>(null)
  const [uploadedResumeUrl, setUploadedResumeUrl] = useState<string | null>(null)

  const supabase = getSupabaseClient() // 获取 Supabase 客户端实例

  useEffect(() => {
    // 检查用户会话
    const checkUserSession = async () => {
      const { data: { session }, error } = await supabase.auth.getSession()
      if (error || !session) {
        router.replace("/") // 未登录则重定向到登录页
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
          logout() // 资料获取失败，视为未登录
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
        setUploadedResumeUrl(profileData.resume_url) // 更新已上传简历URL
      } else {
        setUploadedResumeUrl(user.resumeUrl) // 如果Zustand有数据，直接用
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

  // 雷达图虚拟数据
  const radarData = useMemo(
    () => [
      { 维度: "数据素养", 当前: 45, 目标: 85 },
      { 维度: "用户洞察", 当前: 60, 目标: 90 },
      { 维度: "跨职能协作", 当前: 55, 目标: 88 },
      { 维度: "需求分析", 当前: 62, 目标: 92 },
      { 维度: "产品策略", 当前: 40, 目标: 86 },
      { 维度: "A/B 实验", 当前: 35, 目标: 80 },
    ],
    []
  )

  async function handleResumeUpload(event: React.ChangeEvent<HTMLInputElement>) {
    setUploadError(null)
    if (!event.target.files || event.target.files.length === 0) {
      return
    }

    const file = event.target.files[0]
    if (!user?.id) {
      setUploadError("用户未登录，无法上传文件。")
      return
    }

    setUploading(true)
    setProgress(0)

    try {
      // 模拟上传进度
      let currentProgress = 0
      const interval = setInterval(() => {
        currentProgress += 10
        setProgress(Math.min(currentProgress, 90)) // 模拟到90%
        if (currentProgress >= 90) clearInterval(interval)
      }, 100)

      // 使用简历服务上传文件
      const { url, error } = await resumeService.uploadResume(file)
      
      clearInterval(interval) // 清除模拟进度

      if (error) throw new Error(error)
      if (!url) throw new Error("上传失败，未获取到URL")

      // 更新本地状态
      setUploadedResumeUrl(url)
      login({ ...user, resumeUrl: url }) // 更新 Zustand 状态
      setProgress(100) // 完成进度
      alert("简历上传成功！")

    } catch (err: any) {
      console.error("简历上传失败:", err)
      setUploadError(err.message || "简历上传失败，请重试。")
      setProgress(0) // 重置进度
    } finally {
      setUploading(false)
    }
  }

  async function analyzeBackground() {
    setAnalyzing(true)
    setResult(null)
    
    try {
      // 使用简历服务分析简历
      if (!uploadedResumeUrl) {
        throw new Error("请先上传简历")
      }
      
      const { analysis, error } = await resumeService.analyzeResume(uploadedResumeUrl)
      
      if (error) throw new Error(error)
      if (!analysis) throw new Error("分析失败，未获取到结果")
      
      // 转换为组件需要的格式
      const res: AnalysisResult = {
        strengths: [
          { title: "系统性思维", desc: "具备结构化分析复杂问题的能力", icon: <BrainCircuit className="h-5 w-5 text-purple-600" /> },
          { title: "用户洞察", desc: "善于从访谈与数据中提炼可行动结论", icon: <Sparkles className="h-5 w-5 text-purple-600" /> },
          { title: "增长意识", desc: "理解漏斗与增长模型，关注关键指标", icon: <TrendingUp className="h-5 w-5 text-purple-600" /> },
        ],
        gaps: analysis.gaps || [],
        projects: analysis.recommended_projects?.map(p => ({
          id: p.id,
          title: p.title,
          brief: p.brief
        })) || [],
      }
      setResult(res)
    } catch (err: any) {
      console.error("分析错误:", err)
      setUploadError(err.message || "分析失败，请重试")
    } finally {
      setAnalyzing(false)
    }
  }

  if (!user) {
    return null // 或者显示加载动画
  }

  return (
    <main className="min-h-screen bg-gray-50">

      <section className="mx-auto grid max-w-6xl gap-6 px-4 py-6 lg:grid-cols-3">
        {/* 左侧：欢迎与进度 */}
        <div className="grid gap-6 lg:col-span-1">
          <Card>
            <CardHeader>
              <CardTitle>欢迎回来</CardTitle>
            </CardHeader>
            <CardContent className="text-sm text-gray-600">
              <p>用户：{user?.name}</p>
              <p>教育背景：{user?.education || "未填写"}</p>
              <p className="mt-2">职业目标：{user?.careerGoal || "未填写"}</p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>职业准备进度</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="mb-2 text-sm text-gray-600">当前分数：{progress} / 100</div>
              <Progress value={progress} />
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>上传资料</CardTitle>
            </CardHeader>
            <CardContent className="grid gap-3">
              <div className="grid gap-2">
                <Label htmlFor="resume">上传简历（PDF 或 Word）</Label>
                <div className="relative">
                  <Input id="resume" type="file" accept=".pdf,.doc,.docx" onChange={handleResumeUpload} disabled={uploading} />
                  <FileText className="pointer-events-none absolute right-3 top-1/2 h-4 w-4 -translate-y-1/2 text-gray-400" />
                </div>
                {uploading && (
                  <div className="flex items-center gap-2 text-sm text-gray-600">
                    <Loader2 className="h-4 w-4 animate-spin text-purple-600" />
                    正在上传与处理，请稍候… ({progress}%)
                  </div>
                )}
                {uploadError && (
                  <div className="text-sm text-red-600 flex items-center gap-1">
                    <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><circle cx="12" cy="12" r="10"/><line x1="12" y1="8" x2="12" y2="12"/><line x1="12" y1="16" x2="12.01" y2="16"/></svg>
                    {uploadError}
                  </div>
                )}
                {uploadedResumeUrl && !uploading && !uploadError && (
                  <div className="text-sm text-green-600 flex items-center gap-1">
                    <CheckCircle className="h-4 w-4" />
                    简历已上传：<a href={uploadedResumeUrl} target="_blank" rel="noopener noreferrer" className="underline hover:text-green-700">查看文件</a>
                  </div>
                )}
              </div>
              <div className="grid gap-2">
                <Label htmlFor="linkedin">或填写 LinkedIn 链接</Label>
                <div className="relative">
                  <Input
                    id="linkedin"
                    placeholder="https://www.linkedin.com/in/你的用户名"
                    value={linkedin}
                    onChange={(e) => setLinkedin(e.target.value)}
                  />
                  <Link2 className="pointer-events-none absolute right-3 top-1/2 h-4 w-4 -translate-y-1/2 text-gray-400" />
                </div>
              </div>
              <Button onClick={analyzeBackground} disabled={analyzing} className="bg-purple-600 hover:bg-purple-700">
                {analyzing ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : <BrainCircuit className="mr-2 h-4 w-4" />}
                分析我的背景
              </Button>
            </CardContent>
          </Card>
        </div>

        {/* 右侧：雷达图 + 分析结果 */}
        <div className="grid gap-6 lg:col-span-2">
          <Card>
            <CardHeader>
              <CardTitle>你的职业成长之路（技能雷达）</CardTitle>
            </CardHeader>
            <CardContent className="h-[320px]">
              <ChartContainer
                config={{
                  当前: { label: "当前", color: "hsl(var(--chart-2))" },
                  目标: { label: "目标", color: "hsl(var(--chart-1))" },
                }}
                className="h-full"
              >
                <ResponsiveContainer width="100%" height="100%">
                  <RadarChart data={radarData}>
                    <PolarGrid />
                    <PolarAngleAxis dataKey="维度" />
                    <PolarRadiusAxis angle={30} domain={[0, 100]} />
                    <ChartTooltip content={<ChartTooltipContent />} />
                    <Radar
                      name="当前"
                      dataKey="当前"
                      stroke="var(--color-当前)"
                      fill="var(--color-当前)"
                      fillOpacity={0.4}
                    />
                    <Radar
                      name="目标"
                      dataKey="目标"
                      stroke="var(--color-目标)"
                      fill="var(--color-目标)"
                      fillOpacity={0.2}
                    />
                  </RadarChart>
                </ResponsiveContainer>
              </ChartContainer>
            </CardContent>
          </Card>

          <div className="grid gap-6 md:grid-cols-2">
            <Card>
              <CardHeader>
                <CardTitle>检测到的优势</CardTitle>
              </CardHeader>
              <CardContent className="grid gap-3">
                {(result?.strengths ?? []).length === 0 ? (
                  <p className="text-sm text-gray-500">点击「分析我的背景」后，将展示你的优势亮点。</p>
                ) : (
                  result?.strengths.map((s, i) => (
                    <div key={i} className="flex items-start gap-3 rounded-md border p-3">
                      <div>{s.icon}</div>
                      <div>
                        <div className="font-medium">{s.title}</div>
                        <div className="text-sm text-gray-600">{s.desc}</div>
                      </div>
                    </div>
                  ))
                )}
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle>技能缺口</CardTitle>
              </CardHeader>
              <CardContent className="flex flex-wrap gap-2">
                {(result?.gaps ?? []).length === 0 ? (
                  <p className="text-sm text-gray-500">点击「分析我的背景」后，将展示建议补齐的能力点。</p>
                ) : (
                  result?.gaps.map((g, i) => (
                    <Badge key={i} variant="secondary" className="text-xs">
                      {g}
                    </Badge>
                  ))
                )}
              </CardContent>
            </Card>
          </div>

          <Card>
            <CardHeader>
              <CardTitle>推荐的模拟项目</CardTitle>
            </CardHeader>
            <CardContent className="grid gap-4">
              {(result?.projects ?? []).length === 0 ? (
                <p className="text-sm text-gray-500">点击「分析我的背景」后，将为你推荐匹配的练习项目。</p>
              ) : (
                result?.projects.map((p) => (
                  <div key={p.id} className="flex items-start justify-between gap-4 rounded-md border p-4">
                    <div>
                      <div className="font-medium">{p.title}</div>
                      <div className="text-sm text-gray-600">{p.brief}</div>
                    </div>
                    <Button asChild variant="outline">
                      <Link href={`/project?id=${encodeURIComponent(p.id)}`}>查看完整项目简介</Link>
                    </Button>
                  </div>
                ))
              )}
            </CardContent>
          </Card>
        </div>
      </section>
    </main>
  )
}

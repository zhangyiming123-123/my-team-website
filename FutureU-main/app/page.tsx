"use client"

import { useRouter } from "next/navigation"
import { useState, useEffect } from "react"
import { Button } from "@/components/ui/button"
import { Card, CardContent } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import Link from "next/link"
import { useUserStore } from "@/store/user-store"
import { Loader2, LogIn, Mail, UserRound, GraduationCap, TargetIcon, BadgeCheck } from 'lucide-react'
import { getSupabaseClient, getCurrentUserId } from "@/lib/supabase/client" // 导入 Supabase 客户端
import { profileService } from "@/lib/supabase/services"

export default function Page() {
  const router = useRouter()
  const { login, setLoading } = useUserStore() // 移除 register，因为 Supabase 直接处理
  const [mode, setMode] = useState<"login" | "register">("login")
  const [loading, setIsLoading] = useState(false) // 独立管理加载状态
  const [error, setError] = useState<string | null>(null) // 错误信息

  const supabase = getSupabaseClient() // 获取 Supabase 客户端实例

  // 登录表单
  const [email, setEmail] = useState("")
  const [password, setPassword] = useState("")

  // 注册表单
  const [name, setName] = useState("")
  const [education, setEducation] = useState("") // 更改变量名以匹配 Supabase 字段
  const [careerGoal, setCareerGoal] = useState("") // 更改变量名以匹配 Supabase 字段

  async function handleLogin(e: React.FormEvent) {
    e.preventDefault()
    setIsLoading(true)
    setError(null)
    try {
      const { data, error: authError } = await supabase.auth.signInWithPassword({
        email,
        password,
      })

      if (authError) {
        // 检查是否是邮箱未确认的错误
        if (authError.message === 'Email not confirmed') {
          // 发送确认邮件
          const { error: resendError } = await supabase.auth.resend({
            type: 'signup',
            email,
          })
          
          if (resendError) {
            throw resendError
          } else {
            throw new Error('邮箱未确认，我们已重新发送确认邮件，请查收并点击确认链接')
          }
        } else {
          throw authError
        }
      }

      if (data.user) {
        // 获取用户资料
        const profile = await profileService.getCurrentProfile()
        if (!profile) throw new Error('无法获取用户资料')
        
        login({
          id: data.user.id, // 存储用户ID
          name: profile.full_name,
          email: data.user.email!,
          education: profile.education,
          careerGoal: profile.career_goal,
          resumeUrl: profile.resume_url, // 存储简历URL
        })
        router.push("/dashboard")
      }
    } catch (err: any) {
      console.error("登录失败:", err)
      setError(err.message || "登录失败，请检查邮箱和密码。")
    } finally {
      setIsLoading(false)
    }
  }

  async function handleGoogleLogin() {
    setIsLoading(true)
    setError(null)
    try {
      const { error: authError } = await supabase.auth.signInWithOAuth({
        provider: 'google',
        options: {
          redirectTo: `${window.location.origin}/auth/callback`, // 更改为使用回调处理程序
        },
      })

      if (authError) throw authError
      // Google 登录会重定向，所以这里不需要手动 push
    } catch (err: any) {
      console.error("Google 登录失败:", err)
      setError(err.message || "Google 登录失败。")
    } finally {
      setIsLoading(false)
    }
  }

  async function handleRegister(e: React.FormEvent) {
    e.preventDefault()
    setIsLoading(true)
    setError(null)
    try {
      // 在注册时传递用户元数据，这样触发器可以使用这些数据创建 profile 记录
      const { data, error: authError } = await supabase.auth.signUp({
        email,
        password,
        options: {
          data: {
            full_name: name,
            education: education,
            career_goal: careerGoal
          },
          emailRedirectTo: `${window.location.origin}/auth/callback`
        }
      })

      if (authError) throw authError

      // 检查是否需要邮箱确认
      if (data.user && data.session === null) {
        // 用户创建成功但需要邮箱确认
        setError('注册成功！请查收邮箱并点击确认链接以完成注册。')
        setIsLoading(false)
        return
      }

      if (data.user) {
        // 触发器 `handle_new_user` 会自动创建用户资料，
        // 因此这里不再需要调用 `updateProfile`
        login({
          id: data.user.id,
          name,
          email: data.user.email!,
          education,
          careerGoal,
          resumeUrl: null, // 新注册用户没有简历
        })
        router.push("/dashboard")
      }
    } catch (err: any) {
      console.error("注册失败:", err)
      setError(err.message || "注册失败，请重试。")
    } finally {
      setIsLoading(false)
    }
  }

  // 检查用户是否已登录，如果已登录则重定向到仪表盘
  useEffect(() => {
    const checkSession = async () => {
      try {
        const userId = await getCurrentUserId();
        if (userId) {
          const profile = await profileService.getCurrentProfile();
          if (profile) {
            // 用户已登录且有资料，设置用户状态并重定向
            login({
              id: profile.id,
              name: profile.full_name || profile.name, // 使用 full_name 或 name
              email: profile.email || '',
              education: profile.education,
              careerGoal: profile.career_goal,
              resumeUrl: profile.resume_url,
            });
            router.push('/dashboard');
          }
        }
      } catch (error) {
        console.error('会话检查错误:', error);
      }
    };

    checkSession();
  }, [router]);

  return (
    <main className="min-h-screen bg-gradient-to-br from-purple-50 via-white to-blue-50">
      <header className="border-b bg-white/80 backdrop-blur supports-[backdrop-filter]:bg-white/50">
        <div className="mx-auto flex h-16 max-w-5xl items-center justify-between px-4">
          <div className="flex items-center gap-3">
            <div className="flex h-9 w-9 items-center justify-center rounded-lg bg-gradient-to-br from-purple-600 to-pink-600 text-white font-bold">
              FU
            </div>
            <span className="text-xl font-bold bg-gradient-to-r from-purple-700 to-pink-600 bg-clip-text text-transparent">
              FutureU
            </span>
          </div>
          <nav className="hidden md:flex items-center gap-6 text-sm text-gray-600">
            <a className="hover:text-purple-700" href="#features">平台特色</a>
            <a className="hover:text-purple-700" href="#security">数据安全</a>
            <a className="hover:text-purple-700" href="#faq">常见问题</a>
          </nav>
        </div>
      </header>

      <section className="mx-auto grid max-w-5xl gap-8 px-4 py-12 md:grid-cols-2">
        <div className="flex flex-col justify-center">
          <h1 className="mb-4 text-3xl font-extrabold leading-tight text-gray-900 md:text-4xl">
            FutureU · 面向非技术背景的 AI 产品经理成长平台
          </h1>
          <p className="mb-6 text-gray-600">
            使用邮箱或 Google 登录，开启你的职业转型之旅。我们将为你分析背景、识别优势、补齐技能缺口，并提供高质量的模拟项目。
          </p>
          <ul className="grid gap-3 text-gray-700">
            <li className="flex items-center gap-2"><BadgeCheck className="h-4 w-4 text-purple-600" /> 简洁、现代、可信赖的界面</li>
            <li className="flex items-center gap-2"><BadgeCheck className="h-4 w-4 text-purple-600" /> 背景分析与岗位推荐</li>
            <li className="flex items-center gap-2"><BadgeCheck className="h-4 w-4 text-purple-600" /> 模拟项目与作品集沉淀</li>
          </ul>
        </div>

        <Card className="border-0 shadow-xl">
          <CardContent className="p-6">
            <div className="mb-6 flex gap-2 rounded-lg bg-gray-100 p-1">
              <button
                onClick={() => { setMode("login"); setError(null) }}
                className={`flex-1 rounded-md py-2 text-sm font-medium transition ${
                  mode === "login" ? "bg-white shadow text-gray-900" : "text-gray-500 hover:text-gray-900"
                }`}
              >
                登录
              </button>
              <button
                onClick={() => { setMode("register"); setError(null) }}
                className={`flex-1 rounded-md py-2 text-sm font-medium transition ${
                  mode === "register" ? "bg-white shadow text-gray-900" : "text-gray-500 hover:text-gray-900"
                }`}
              >
                注册
              </button>
            </div>

            {error && (
              <div className={`mb-4 rounded-md p-3 text-sm ${error.includes('成功') ? 'bg-green-50 text-green-700' : 'bg-red-50 text-red-700'}`}>
                {error}
              </div>
            )}

            {mode === "login" ? (
              <form onSubmit={handleLogin} className="grid gap-4">
                <div className="grid gap-2">
                  <Label htmlFor="email">邮箱</Label>
                  <div className="relative">
                    <Mail className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-400" />
                    <Input
                      id="email"
                      type="email"
                      placeholder="your@email.com"
                      className="pl-9"
                      value={email}
                      onChange={(e) => setEmail(e.target.value)}
                      required
                      autoComplete="email"
                    />
                  </div>
                </div>
                <div className="grid gap-2">
                  <Label htmlFor="password">密码</Label>
                  <Input
                    id="password"
                    type="password"
                    placeholder="请输入密码"
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    required
                    autoComplete="current-password"
                  />
                </div>

                <Button type="submit" disabled={loading} className="mt-2 bg-purple-600 hover:bg-purple-700">
                  {loading ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : <LogIn className="mr-2 h-4 w-4" />}
                  立即登录
                </Button>

                <Button type="button" variant="secondary" disabled={loading} onClick={handleGoogleLogin}>
                  <img
                    alt="Google"
                    src="/placeholder.svg?height=16&width=16"
                    className="mr-2 h-4 w-4"
                  />
                  使用 Google 登录
                </Button>

                <p className="text-xs text-gray-500">
                  登录/注册即表示同意
                  <Link className="mx-1 text-purple-600 hover:underline" href="/terms">服务条款</Link>
                  与
                  <Link className="ml-1 text-purple-600 hover:underline" href="/privacy">隐私政策</Link>
                </p>
              </form>
            ) : (
              <form onSubmit={handleRegister} className="grid gap-4">
                <div className="grid gap-2">
                  <Label htmlFor="name">姓名</Label>
                  <div className="relative">
                    <UserRound className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-400" />
                    <Input
                      id="name"
                      placeholder="请输入姓名"
                      className="pl-9"
                      value={name}
                      onChange={(e) => setName(e.target.value)}
                      required
                    />
                  </div>
                </div>
                <div className="grid gap-2">
                  <Label htmlFor="reg-email">邮箱</Label>
                  <Input
                    id="reg-email"
                    type="email"
                    placeholder="用于接收通知与项目进度"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    required
                    autoComplete="email"
                  />
                </div>
                <div className="grid gap-2">
                  <Label htmlFor="education">教育背景</Label>
                  <div className="relative">
                    <GraduationCap className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-400" />
                    <Input
                      id="education"
                      placeholder="例如：人文、商科、艺术设计等"
                      className="pl-9"
                      value={education}
                      onChange={(e) => setEducation(e.target.value)}
                      required
                    />
                  </div>
                </div>
                <div className="grid gap-2">
                  <Label htmlFor="careerGoal">职业目标</Label>
                  <div className="relative">
                    <TargetIcon className="absolute left-3 top-2.5 h-4 w-4 text-gray-400" />
                    <textarea
                      id="careerGoal"
                      placeholder="请简要描述你的职业目标（如：1 年内转型为 AI 产品经理）"
                      className="min-h-[80px] w-full rounded-md border border-input bg-background px-9 py-2 text-sm ring-offset-background placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2"
                      value={careerGoal}
                      onChange={(e) => setCareerGoal(e.target.value)}
                    />
                  </div>
                </div>
                <div className="grid gap-2">
                  <Label htmlFor="reg-password">设置密码</Label>
                  <Input
                    id="reg-password"
                    type="password"
                    placeholder="至少 8 位字符"
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    required
                    autoComplete="new-password"
                  />
                </div>

                <Button type="submit" disabled={loading} className="mt-2 bg-purple-600 hover:bg-purple-700">
                  {loading ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : null}
                  立即注册并进入控制面板
                </Button>
              </form>
            )}
          </CardContent>
        </Card>
      </section>

      <footer className="border-t bg-white/70">
        <div className="mx-auto flex max-w-5xl items-center justify-between px-4 py-6 text-sm text-gray-500">
          <p>© 2025 FutureU. 保留所有权利</p>
          <div className="flex items-center gap-4">
            <Link href="/privacy" className="hover:text-purple-700">隐私政策</Link>
            <Link href="/terms" className="hover:text-purple-700">服务条款</Link>
            <Link href="/contact" className="hover:text-purple-700">联系我们</Link>
          </div>
        </div>
      </footer>
    </main>
  )
}

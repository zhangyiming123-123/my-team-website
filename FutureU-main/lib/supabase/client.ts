// lib/supabase/client.ts
import { createClient } from '@supabase/supabase-js'
import { createClientComponentClient } from '@supabase/auth-helpers-nextjs'
import { Database } from './types'

// 从环境变量中读取 Supabase URL 和 Anon Key
// 注意：在 Next.js 客户端组件中，环境变量需要以 NEXT_PUBLIC_ 开头
const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY

// 创建 Supabase 客户端实例
// 使用单例模式确保在整个应用中只创建一个客户端实例
let supabase: ReturnType<typeof createClient<Database>> | undefined

export function getSupabaseClient() {
  if (typeof window === 'undefined') {
    // 服务器端
    // 在服务器端直接使用基本客户端，不依赖 cookies
    return createClient<Database>(supabaseUrl!, supabaseAnonKey!)
  }

  // 客户端组件
  if (!supabase) {
    if (!supabaseUrl || !supabaseAnonKey) {
      throw new Error('缺少 Supabase 环境变量。请确保在 .env.local 文件中设置了 NEXT_PUBLIC_SUPABASE_URL 和 NEXT_PUBLIC_SUPABASE_ANON_KEY。')
    }
    
    supabase = createClientComponentClient<Database>({
      supabaseUrl: supabaseUrl,
      supabaseKey: supabaseAnonKey,
    })
  }
  return supabase
}

// 辅助函数：检查是否在客户端环境
export function isClient() {
  return typeof window !== 'undefined'
}

// 辅助函数：获取当前用户ID
export async function getCurrentUserId() {
  const supabase = getSupabaseClient()
  const { data } = await supabase.auth.getSession()
  return data.session?.user?.id || null
}

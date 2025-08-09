# FutureU Supabase 集成指南

本文档提供了如何设置和配置 Supabase 以支持 FutureU 应用程序的指南。

## 设置 Supabase 项目

1. 访问 [Supabase](https://supabase.com/) 并创建一个账户
2. 创建一个新项目
3. 记下项目 URL 和 anon key（公共密钥）

## 配置环境变量

1. 在项目根目录创建或编辑 `.env.local` 文件
2. 添加以下环境变量：

```
NEXT_PUBLIC_SUPABASE_URL=https://your-project-url.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=your-anon-key
```

## 数据库设置

1. 在 Supabase 控制面板中，导航到 SQL 编辑器
2. 运行 `schema.sql` 文件中的 SQL 命令来创建必要的表和策略

## 存储桶设置

1. 在 Supabase 控制面板中，导航到 Storage
2. 创建一个名为 `resumes` 的新存储桶
3. 配置存储桶权限：
   - 将 `INSERT` 和 `SELECT` 权限设置为 `authenticated`（已认证用户）
   - 将 `UPDATE` 和 `DELETE` 权限设置为 `none`（无人）

## 身份验证设置

1. 在 Supabase 控制面板中，导航到 Authentication > Settings
2. 配置 Site URL 为你的应用程序 URL（开发环境通常为 `http://localhost:3000`）
3. 如果需要 Google 登录，配置 OAuth 提供商：
   - 导航到 Authentication > Providers
   - 启用 Google 提供商
   - 添加你的 Google OAuth 客户端 ID 和密钥

## 数据库表结构

### profiles 表

存储用户个人资料信息。

| 列名 | 类型 | 描述 |
|------|------|------|
| id | UUID | 主键，关联到 auth.users |
| name | TEXT | 用户姓名 |
| education | TEXT | 教育背景 |
| career_goal | TEXT | 职业目标 |
| resume_url | TEXT | 简历文件 URL |
| linkedin_url | TEXT | LinkedIn 个人资料 URL |
| created_at | TIMESTAMP | 创建时间 |
| updated_at | TIMESTAMP | 更新时间 |

### resume_analysis 表

存储简历分析结果。

| 列名 | 类型 | 描述 |
|------|------|------|
| id | UUID | 主键 |
| user_id | UUID | 关联到 profiles 表 |
| resume_url | TEXT | 分析的简历 URL |
| strengths | JSONB | 检测到的优势 |
| gaps | JSONB | 技能缺口 |
| recommended_projects | JSONB | 推荐项目 |
| skills_radar | JSONB | 技能雷达数据 |
| created_at | TIMESTAMP | 创建时间 |

### project_progress 表

跟踪用户项目进度。

| 列名 | 类型 | 描述 |
|------|------|------|
| id | UUID | 主键 |
| user_id | UUID | 关联到 profiles 表 |
| project_id | TEXT | 项目标识符 |
| status | TEXT | 项目状态 |
| progress | INTEGER | 完成百分比 |
| deliverables | JSONB | 项目交付物 |
| created_at | TIMESTAMP | 创建时间 |
| updated_at | TIMESTAMP | 更新时间 |

### job_recommendations 表

存储职位推荐。

| 列名 | 类型 | 描述 |
|------|------|------|
| id | UUID | 主键 |
| user_id | UUID | 关联到 profiles 表 |
| company | TEXT | 公司名称 |
| position | TEXT | 职位名称 |
| location | TEXT | 工作地点 |
| salary | TEXT | 薪资范围 |
| match_score | INTEGER | 匹配分数 |
| match_reason | TEXT | 匹配原因 |
| tags | JSONB | 职位标签 |
| created_at | TIMESTAMP | 创建时间 |
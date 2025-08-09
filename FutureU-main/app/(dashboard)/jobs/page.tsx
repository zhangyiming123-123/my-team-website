'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { useUserStore } from '@/store/user-store';
import { useJobRecommendations } from '@/lib/supabase/hooks';
import { Loader2, Star, MapPin, Building, DollarSign, Tag } from 'lucide-react';

export default function JobsPage() {
  const router = useRouter();
  const user = useUserStore((state) => state.user);
  const { recommendations: jobs, loading, error: hookError } = useJobRecommendations();
  const [error, setError] = useState<string | null>(hookError ? hookError.message : null);
  
  // 如果用户未登录，重定向到首页
  if (!user) {
    router.push('/');
    return null;
  }

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50">
        <Loader2 className="h-8 w-8 animate-spin text-indigo-600" />
        <span className="ml-2 text-lg">加载中...</span>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 py-12 px-4 sm:px-6 lg:px-8">
      <div className="max-w-4xl mx-auto">
        <div className="mb-8">
          <h1 className="text-2xl font-bold text-gray-900">职位推荐</h1>
        </div>

        {error ? (
          <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-md">
            {error}
          </div>
        ) : jobs.length === 0 ? (
          <div className="bg-white shadow rounded-lg p-6 text-center">
            <p className="text-gray-500">暂无职位推荐，请先上传简历并完成分析。</p>
            <button
              onClick={() => router.push('/dashboard')}
              className="mt-4 inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md shadow-sm text-white bg-indigo-600 hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500"
            >
              前往仪表盘
            </button>
          </div>
        ) : (
          <div className="space-y-6">
            {jobs.map((job, index) => (
              <div key={index} className="bg-white shadow rounded-lg overflow-hidden">
                <div className="p-6">
                  <div className="flex justify-between items-start">
                    <div>
                      <h2 className="text-xl font-semibold text-gray-900">{job.position}</h2>
                      <div className="flex items-center mt-1">
                        <Building className="h-4 w-4 text-gray-500 mr-1" />
                        <span className="text-gray-600">{job.company}</span>
                      </div>
                    </div>
                    <div className="flex items-center bg-indigo-50 px-3 py-1 rounded-full">
                      <Star className="h-4 w-4 text-indigo-600 mr-1" />
                      <span className="text-indigo-700 font-medium">{job.match_score}% 匹配</span>
                    </div>
                  </div>
                  
                  <div className="mt-4 flex flex-wrap gap-4">
                    <div className="flex items-center text-gray-600">
                      <MapPin className="h-4 w-4 mr-1" />
                      <span>{job.location}</span>
                    </div>
                    <div className="flex items-center text-gray-600">
                      <DollarSign className="h-4 w-4 mr-1" />
                      <span>{job.salary}</span>
                    </div>
                  </div>
                  
                  <div className="mt-4">
                    <p className="text-gray-700">{job.match_reason}</p>
                  </div>
                  
                  <div className="mt-4 flex flex-wrap gap-2">
                    {job.tags.map((tag, tagIndex) => (
                      <div key={tagIndex} className="flex items-center bg-gray-100 px-3 py-1 rounded-full text-sm text-gray-700">
                        <Tag className="h-3 w-3 mr-1" />
                        {tag}
                      </div>
                    ))}
                  </div>
                  
                  <div className="mt-6 flex justify-end">
                    <button className="inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md text-indigo-700 bg-indigo-100 hover:bg-indigo-200 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500">
                      查看详情
                    </button>
                    <button className="ml-3 inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md shadow-sm text-white bg-indigo-600 hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500">
                      申请职位
                    </button>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
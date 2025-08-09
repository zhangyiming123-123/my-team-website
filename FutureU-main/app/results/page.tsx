import Link from "next/link"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Download, MapPin, DollarSign, Building, Star, TrendingUp } from 'lucide-react'

export default function ResultsPage() {
  const compiledSkills = [
    { original: "机械建模", compiled: "复杂系统逻辑构建", strength: 92 },
    { original: "市场调研", compiled: "用户需求分析", strength: 88 },
    { original: "项目管理", compiled: "跨职能协作", strength: 85 },
    { original: "数据分析", compiled: "数据驱动决策", strength: 90 },
  ]

  const jobRecommendations = [
    {
      id: 1,
      company: "字节跳动",
      logo: "/placeholder.svg?height=60&width=60&text=字节",
      position: "AI 用户行为分析产品经理",
      location: "北京",
      salary: "25-40K",
      matchScore: 92,
      matchReason: "该岗位重视复杂系统逻辑，与你的工程背景高度契合。",
      tags: ["AI产品", "用户分析", "B端产品"]
    },
    {
      id: 2,
      company: "腾讯",
      logo: "/placeholder.svg?height=60&width=60&text=腾讯",
      position: "智能推荐算法产品经理",
      location: "深圳",
      salary: "30-45K",
      matchScore: 89,
      matchReason: "你的数据分析能力与推荐算法产品需求完美匹配。",
      tags: ["推荐算法", "数据产品", "C端产品"]
    },
    {
      id: 3,
      company: "阿里巴巴",
      logo: "/placeholder.svg?height=60&width=60&text=阿里",
      position: "AI 商业化产品经理",
      location: "杭州",
      salary: "28-42K",
      matchScore: 86,
      matchReason: "你的市场调研经验转化为商业洞察力，正是我们需要的。",
      tags: ["商业化", "AI产品", "策略产品"]
    }
  ]

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <header className="bg-white shadow-sm border-b">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center h-16">
            <Link href="/" className="flex items-center">
              <div className="w-10 h-10 bg-[#0A427E] rounded-lg flex items-center justify-center">
                <span className="text-white font-bold text-lg">FU</span>
              </div>
              <span className="ml-3 text-xl font-bold text-[#0A427E]">FutureU</span>
            </Link>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="grid lg:grid-cols-2 gap-8">
          {/* Left Column - Compilation Results */}
          <div className="space-y-6">
            <div>
              <h1 className="text-2xl font-bold text-[#0A427E] mb-6">
                你的全新能力图谱
              </h1>
            </div>

            {/* Compiled Resume Preview */}
            <Card>
              <CardHeader>
                <CardTitle className="text-lg text-[#0A427E]">编译后简历预览</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-4 max-h-64 overflow-y-auto">
                  <div className="p-4 bg-gray-50 rounded-lg">
                    <h3 className="font-semibold text-[#0A427E] mb-2">核心技能</h3>
                    <div className="flex flex-wrap gap-2">
                      <Badge className="bg-[#7B68EE] text-white">复杂系统逻辑构建</Badge>
                      <Badge className="bg-[#7B68EE] text-white">用户需求分析</Badge>
                      <Badge className="bg-[#7B68EE] text-white">跨职能协作</Badge>
                      <Badge className="bg-[#7B68EE] text-white">数据驱动决策</Badge>
                    </div>
                  </div>
                  <div className="p-4 bg-gray-50 rounded-lg">
                    <h3 className="font-semibold text-[#0A427E] mb-2">项目经验</h3>
                    <p className="text-sm text-gray-600">
                      • 负责<span className="bg-[#7B68EE] bg-opacity-20 px-1 rounded">复杂机械系统建模</span>，具备<span className="bg-[#7B68EE] bg-opacity-20 px-1 rounded">系统性思维</span>和<span className="bg-[#7B68EE] bg-opacity-20 px-1 rounded">逻辑分析能力</span>
                    </p>
                    <p className="text-sm text-gray-600 mt-2">
                      • 通过<span className="bg-[#7B68EE] bg-opacity-20 px-1 rounded">市场调研</span>优化产品设计，展现<span className="bg-[#7B68EE] bg-opacity-20 px-1 rounded">用户洞察</span>和<span className="bg-[#7B68EE] bg-opacity-20 px-1 rounded">需求分析</span>能力
                    </p>
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* Ability Linking Visualization */}
            <Card>
              <CardHeader>
                <CardTitle className="text-lg text-[#0A427E]">能力链接可视化</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  {compiledSkills.map((skill, index) => (
                    <div key={index} className="flex items-center space-x-4 p-3 bg-gray-50 rounded-lg">
                      <div className="flex-1">
                        <div className="flex items-center justify-between mb-2">
                          <span className="text-sm font-medium text-gray-600">{skill.original}</span>
                          <TrendingUp className="h-4 w-4 text-[#7B68EE]" />
                          <span className="text-sm font-medium text-[#0A427E]">{skill.compiled}</span>
                        </div>
                        <div className="w-full bg-gray-200 rounded-full h-2">
                          <div 
                            className="bg-[#7B68EE] h-2 rounded-full transition-all duration-500"
                            style={{ width: `${skill.strength}%` }}
                          ></div>
                        </div>
                        <div className="text-right mt-1">
                          <span className="text-xs text-gray-500">匹配度: {skill.strength}%</span>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>

            {/* Export Button */}
            <div className="text-center">
              <Button className="bg-[#7B68EE] hover:bg-[#6A5ACD] text-white px-6 py-3 font-semibold rounded-lg shadow-lg hover:shadow-xl transition-all">
                <Download className="mr-2 h-5 w-5" />
                一键生成并导出新简历
              </Button>
            </div>
          </div>

          {/* Right Column - Job Recommendations */}
          <div className="space-y-6">
            <div>
              <h1 className="text-2xl font-bold text-[#0A427E] mb-6">
                机会雷达为你发现的战场
              </h1>
            </div>

            <div className="space-y-4">
              {jobRecommendations.map((job) => (
                <Card key={job.id} className="p-4 bg-white rounded-lg shadow-md hover:shadow-lg transition-shadow">
                  <CardContent className="p-0">
                    <div className="flex items-start space-x-4">
                      <img 
                        src={job.logo || "/placeholder.svg"} 
                        alt={job.company}
                        className="w-12 h-12 rounded-lg object-cover"
                      />
                      <div className="flex-1">
                        <div className="flex items-start justify-between mb-2">
                          <div>
                            <h3 className="font-semibold text-[#0A427E] text-lg">{job.position}</h3>
                            <p className="text-gray-600 flex items-center mt-1">
                              <Building className="h-4 w-4 mr-1" />
                              {job.company}
                            </p>
                          </div>
                          <Badge 
                            className={`text-white font-bold ${
                              job.matchScore >= 90 ? 'bg-green-500' : 
                              job.matchScore >= 85 ? 'bg-orange-500' : 'bg-blue-500'
                            }`}
                          >
                            匹配度: {job.matchScore}%
                          </Badge>
                        </div>
                        
                        <div className="flex items-center space-x-4 text-sm text-gray-600 mb-3">
                          <span className="flex items-center">
                            <MapPin className="h-4 w-4 mr-1" />
                            {job.location}
                          </span>
                          <span className="flex items-center">
                            <DollarSign className="h-4 w-4 mr-1" />
                            {job.salary}
                          </span>
                        </div>

                        <div className="flex flex-wrap gap-2 mb-3">
                          {job.tags.map((tag, index) => (
                            <Badge key={index} variant="secondary" className="text-xs">
                              {tag}
                            </Badge>
                          ))}
                        </div>

                        <p className="text-sm text-gray-600 mb-4 bg-blue-50 p-2 rounded">
                          <Star className="h-4 w-4 inline mr-1 text-blue-500" />
                          {job.matchReason}
                        </p>

                        <Button 
                          variant="outline" 
                          className="w-full border-[#7B68EE] text-[#7B68EE] hover:bg-[#7B68EE] hover:text-white"
                        >
                          查看详情与申请
                        </Button>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}

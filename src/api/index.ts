import { TStory } from '../types'

/**
 * 后端 API 地址
 * 开发环境：使用 Vite 代理，直接请求 /api
 * 生产环境：使用环境变量配置的地址
 */
const API_BASE_URL = import.meta.env.VITE_API_BASE_URL || ''

/**
 * 调用后端 AI 接口获取回答
 * @param question 玩家的问题
 * @param story 当前故事
 * @returns AI 的回答（"是"、"否" 或 "无关"）
 */
export async function askAI(question: string, story: TStory): Promise<string> {
  try {
    const response = await fetch(`${API_BASE_URL}/api/chat`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({
        question,
        story: {
          id: story.id,
          title: story.title,
          surface: story.surface,
          bottom: story.bottom
        }
      })
    })

    // 处理 HTTP 错误
    if (!response.ok) {
      const errorData = await response.json().catch(() => ({}))
      throw new Error(errorData.error || `请求失败: ${response.status}`)
    }

    const data = await response.json()

    if (!data.success) {
      throw new Error(data.error || 'AI 回答失败')
    }

    return data.answer

  } catch (error) {
    console.error('API 调用失败:', error)
    // 降级到模拟回答
    return mockResponse()
  }
}

/**
 * 模拟回答（用于测试或 API 不可用时）
 */
function mockResponse(): string {
  const answers = ['是', '否', '无关']
  return answers[Math.floor(Math.random() * answers.length)]
}

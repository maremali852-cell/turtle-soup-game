import type { VercelRequest, VercelResponse } from '@vercel/node'

/**
 * 故事类型定义
 */
interface Story {
  id: string
  title: string
  surface: string
  bottom: string
}

/**
 * 请求体类型
 */
interface RequestBody {
  question: string
  story: Story
}

/**
 * 构建 AI Prompt
 */
function buildPrompt(question: string, story: Story): string {
  return `你是一个海龟汤游戏的主持人。

当前故事的汤面是：${story.surface}
故事的汤底是：${story.bottom}

玩家会向你提问，你只能回答以下三种之一：
1. "是"：玩家的猜测与汤底一致
2. "否"：玩家的猜测与汤底矛盾
3. "无关"：玩家的猜测与汤底无关，无法判断

注意：
1. 严格根据汤底判断，不要额外推理
2. 只回答"是"、"否"、"无关"，不要解释
3. 保持神秘感，不要透露汤底

玩家问：${question}
请回答：`
}

/**
 * 调用 DeepSeek API
 */
async function callDeepSeekAPI(prompt: string): Promise<string> {
  const apiKey = process.env.DEEPSEEK_API_KEY
  const baseUrl = process.env.DEEPSEEK_BASE_URL || 'https://api.deepseek.com'

  if (!apiKey) {
    throw new Error('未配置 DEEPSEEK_API_KEY')
  }

  const response = await fetch(`${baseUrl}/v1/chat/completions`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'Authorization': `Bearer ${apiKey}`
    },
    body: JSON.stringify({
      model: 'deepseek-chat',
      messages: [
        {
          role: 'user',
          content: prompt
        }
      ],
      temperature: 0.1,
      max_tokens: 10
    })
  })

  if (!response.ok) {
    const errorData = await response.json().catch(() => ({}))
    throw new Error(errorData.error?.message || `API请求失败: ${response.status}`)
  }

  const data = await response.json()
  const content = data.choices?.[0]?.message?.content?.trim() || ''

  // 验证回答
  const validAnswers = ['是', '否', '无关']
  if (validAnswers.includes(content)) {
    return content
  }

  // 模糊匹配
  if (content.includes('是')) return '是'
  if (content.includes('否')) return '否'
  return '无关'
}

/**
 * Vercel Serverless Function 入口
 * POST /api/chat
 */
export default async function handler(
  req: VercelRequest,
  res: VercelResponse
) {
  // 设置 CORS 头
  res.setHeader('Access-Control-Allow-Origin', '*')
  res.setHeader('Access-Control-Allow-Methods', 'POST, OPTIONS')
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type')

  // 处理 OPTIONS 预检请求
  if (req.method === 'OPTIONS') {
    return res.status(200).end()
  }

  // 只接受 POST 请求
  if (req.method !== 'POST') {
    return res.status(405).json({
      success: false,
      error: '方法不允许，请使用 POST'
    })
  }

  try {
    const { question, story } = req.body as RequestBody

    // 参数验证
    if (!question || !story) {
      return res.status(400).json({
        success: false,
        error: '缺少必要参数：question 或 story'
      })
    }

    if (!story.surface || !story.bottom) {
      return res.status(400).json({
        success: false,
        error: '故事数据不完整'
      })
    }

    // 构建 Prompt 并调用 AI
    const prompt = buildPrompt(question, story)
    const answer = await callDeepSeekAPI(prompt)

    return res.status(200).json({
      success: true,
      answer
    })

  } catch (error) {
    console.error('API 错误:', error)
    return res.status(500).json({
      success: false,
      error: error instanceof Error ? error.message : '服务器内部错误'
    })
  }
}

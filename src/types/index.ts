/**
 * 海龟汤故事数据类型
 */
export type TDifficulty = 'easy' | 'medium' | 'hard'

export interface TStory {
  id: string
  title: string
  difficulty: TDifficulty
  surface: string  // 汤面
  bottom: string   // 汤底
}

/**
 * 对话消息数据类型
 */
export type TMessageRole = 'user' | 'assistant'

export interface TMessage {
  id: string
  role: TMessageRole
  content: string
  timestamp: number
}

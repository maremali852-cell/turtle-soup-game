import { useState, useRef, useEffect } from 'react'
import { useParams, useNavigate, Link } from 'react-router-dom'
import { STORIES } from '../data/stories'
import { TMessage, TMessageRole } from '../types'
import { askAI } from '../api'
import Toast, { useToast, TToastType } from '../components/Toast'

/**
 * 游戏状态枚举
 */
enum EGameState {
  PLAYING = 'playing',
  GAVE_UP = 'gave_up',
  COMPLETED = 'completed'
}

/**
 * 游戏页面
 */
export default function Game() {
  const { id } = useParams<{ id: string }>()
  const navigate = useNavigate()
  const story = STORIES.find(s => s.id === id)
  
  // 游戏状态
  const [messages, setMessages] = useState<TMessage[]>([])
  const [input, setInput] = useState('')
  const [isLoading, setIsLoading] = useState(false)
  const [gameState, setGameState] = useState<EGameState>(EGameState.PLAYING)
  const [showGiveUpModal, setShowGiveUpModal] = useState(false)
  const [inputShake, setInputShake] = useState(false)
  
  // Toast 提示
  const { toast, showToast, hideToast } = useToast()
  
  // 滚动到底部
  const messagesEndRef = useRef<HTMLDivElement>(null)
  const inputRef = useRef<HTMLInputElement>(null)
  
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' })
  }, [messages])

  // 自动聚焦输入框
  useEffect(() => {
    if (gameState === EGameState.PLAYING && !isLoading) {
      inputRef.current?.focus()
    }
  }, [gameState, isLoading, messages])

  if (!story) {
    return (
      <div className="min-h-screen flex items-center justify-center px-4">
        <div className="text-center animate-fade-in-up">
          <div className="text-6xl mb-4">🔍</div>
          <p className="text-slate-400 text-lg mb-4">故事不存在</p>
          <Link 
            to="/" 
            className="px-6 py-2 bg-amber-600 text-white rounded-lg hover:bg-amber-500 transition-colors inline-block"
          >
            返回首页
          </Link>
        </div>
      </div>
    )
  }

  /**
   * 添加消息
   */
  const addMessage = (role: TMessageRole, content: string) => {
    const message: TMessage = {
      id: Date.now().toString() + Math.random(),
      role,
      content,
      timestamp: Date.now()
    }
    setMessages(prev => [...prev, message])
    return message
  }

  /**
   * 显示提示
   */
  const handleShowToast = (message: string, type: TToastType = 'info') => {
    showToast(message, type)
  }

  /**
   * 触发输入框抖动
   */
  const triggerInputShake = () => {
    setInputShake(true)
    setTimeout(() => setInputShake(false), 500)
  }

  /**
   * 发送消息
   */
  const handleSend = async () => {
    if (gameState !== EGameState.PLAYING) {
      handleShowToast('游戏已结束', 'warning')
      return
    }

    if (!input.trim()) {
      triggerInputShake()
      handleShowToast('请输入问题', 'warning')
      return
    }

    if (isLoading) return

    const question = input.trim()
    setInput('')
    setIsLoading(true)

    // 添加用户消息
    addMessage('user', question)

    try {
      // 调用 AI API
      const answer = await askAI(question, story)
      addMessage('assistant', answer)
    } catch (error) {
      handleShowToast('网络错误，请重试', 'error')
      // 移除刚添加的用户消息
      setMessages(prev => prev.slice(0, -1))
      setInput(question) // 恢复输入
    } finally {
      setIsLoading(false)
    }
  }

  /**
   * 处理按键事件
   */
  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault()
      handleSend()
    }
  }

  /**
   * 放弃游戏
   */
  const handleGiveUp = () => {
    setShowGiveUpModal(true)
  }

  /**
   * 确认放弃
   */
  const confirmGiveUp = () => {
    setGameState(EGameState.GAVE_UP)
    setShowGiveUpModal(false)
    handleShowToast('已放弃游戏', 'info')
  }

  /**
   * 查看汤底
   */
  const handleViewAnswer = () => {
    setGameState(EGameState.COMPLETED)
    navigate(`/result/${story.id}`)
  }

  /**
   * 返回大厅
   */
  const handleBackToHome = () => {
    navigate('/')
  }

  /**
   * 快捷问题建议
   */
  const suggestions = [
    '他是被谋杀的吗？',
    '是意外死亡吗？',
    '有其他人 involved 吗？'
  ]

  return (
    <div className="min-h-screen flex flex-col bg-slate-900">
      {/* Toast 提示 */}
      {toast && (
        <Toast 
          message={toast.message} 
          type={toast.type} 
          onClose={hideToast} 
        />
      )}

      {/* 头部 */}
      <header className="bg-slate-800/90 backdrop-blur-sm border-b border-slate-700 px-4 py-3 sticky top-0 z-40">
        <div className="max-w-2xl mx-auto flex items-center justify-between">
          <div className="flex-1 min-w-0">
            <h1 className="text-lg font-bold text-amber-400 truncate">{story.title}</h1>
            <p className="text-xs text-slate-400">
              {gameState === EGameState.PLAYING 
                ? `已提问 ${messages.filter(m => m.role === 'user').length} 次`
                : gameState === EGameState.GAVE_UP 
                  ? '已放弃' 
                  : '已完成'}
            </p>
          </div>
          
          {/* 游戏状态指示器 */}
          <div className={`px-3 py-1.5 rounded-full text-xs font-medium flex items-center gap-1.5 ${
            gameState === EGameState.PLAYING 
              ? 'bg-green-600/20 text-green-400 border border-green-600/30' 
              : 'bg-slate-600/20 text-slate-400 border border-slate-600/30'
          }`}>
            <span className={`w-2 h-2 rounded-full ${
              gameState === EGameState.PLAYING ? 'bg-green-400 animate-pulse' : 'bg-slate-500'
            }`}></span>
            {gameState === EGameState.PLAYING ? '进行中' : '已结束'}
          </div>
        </div>
      </header>

      {/* 汤面展示 */}
      <div className="bg-slate-800/50 border-b border-slate-700 px-4 py-4">
        <div className="max-w-2xl mx-auto">
          <div className="flex items-center gap-2 mb-2">
            <span className="text-base">📜</span>
            <p className="text-xs text-slate-500 font-medium uppercase tracking-wider">汤面</p>
          </div>
          <p className="text-slate-300 text-sm leading-relaxed">{story.surface}</p>
        </div>
      </div>

      {/* 消息列表 */}
      <div className="flex-1 overflow-y-auto px-4 py-4">
        <div className="max-w-2xl mx-auto space-y-3">
          {/* 空状态 */}
          {messages.length === 0 && gameState === EGameState.PLAYING && (
            <div className="text-center py-12 animate-fade-in-up">
              <div className="text-5xl mb-4">🤔</div>
              <p className="text-slate-400 text-lg mb-2">开始你的推理之旅</p>
              <p className="text-slate-500 text-sm mb-6">
                AI主持人只会回答"是"、"否"、"无关"
              </p>
              
              {/* 快捷问题建议 */}
              <div className="flex flex-wrap justify-center gap-2">
                {suggestions.map((suggestion, index) => (
                  <button
                    key={index}
                    onClick={() => setInput(suggestion)}
                    className="px-3 py-1.5 bg-slate-700/50 text-slate-400 text-sm rounded-full 
                      hover:bg-slate-700 hover:text-slate-300 transition-colors border border-slate-600"
                  >
                    {suggestion}
                  </button>
                ))}
              </div>
            </div>
          )}

          {/* 消息列表 */}
          {messages.map((msg, index) => (
            <div 
              key={msg.id}
              className={`flex ${msg.role === 'user' ? 'justify-end' : 'justify-start'} 
                message-bubble ${msg.role === 'user' ? 'message-bubble-user' : 'message-bubble-ai'}`}
              style={{ animationDelay: `${index * 0.05}s` }}
            >
              <div className={`max-w-[85%] sm:max-w-[75%] px-4 py-2.5 ${
                msg.role === 'user' 
                  ? 'bg-amber-600 text-white rounded-2xl rounded-br-md' 
                  : 'bg-slate-700 text-slate-200 rounded-2xl rounded-bl-md'
              }`}>
                {msg.content}
              </div>
            </div>
          ))}
          
          {/* 加载动画 */}
          {isLoading && (
            <div className="flex justify-start message-bubble message-bubble-ai">
              <div className="bg-slate-700 px-5 py-3 rounded-2xl rounded-bl-md">
                <span className="inline-flex items-center gap-1.5 text-slate-400">
                  <span className="w-2 h-2 bg-amber-400 rounded-full typing-dot"></span>
                  <span className="w-2 h-2 bg-amber-400 rounded-full typing-dot"></span>
                  <span className="w-2 h-2 bg-amber-400 rounded-full typing-dot"></span>
                </span>
              </div>
            </div>
          )}
          
          <div ref={messagesEndRef} />
        </div>
      </div>

      {/* 输入区域 */}
      {gameState === EGameState.PLAYING && (
        <div className="bg-slate-800/90 backdrop-blur-sm border-t border-slate-700 px-4 py-3 safe-bottom">
          <div className="max-w-2xl mx-auto flex gap-2">
            <input
              ref={inputRef}
              type="text"
              value={input}
              onChange={e => setInput(e.target.value)}
              onKeyDown={handleKeyDown}
              placeholder="输入你的问题..."
              className={`flex-1 px-4 py-3 bg-slate-700 border rounded-xl 
                focus:border-amber-400 focus:outline-none focus:ring-1 focus:ring-amber-400/30
                text-white placeholder-slate-500 transition-all
                ${inputShake ? 'animate-shake border-red-500' : 'border-slate-600'}
              `}
              disabled={isLoading}
            />
            <button
              onClick={handleSend}
              disabled={isLoading || !input.trim()}
              className="px-5 py-3 bg-amber-600 text-white rounded-xl 
                hover:bg-amber-500 disabled:opacity-50 disabled:cursor-not-allowed 
                transition-all btn-press flex items-center gap-2
                disabled:hover:bg-amber-600"
            >
              {isLoading ? (
                <span className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin"></span>
              ) : (
                <span>发送</span>
              )}
            </button>
          </div>
        </div>
      )}

      {/* 底部操作按钮 */}
      <div className="bg-slate-900 border-t border-slate-700 px-4 py-3 safe-bottom">
        <div className="max-w-2xl mx-auto flex gap-3">
          {gameState === EGameState.PLAYING ? (
            <>
              <button
                onClick={handleGiveUp}
                className="flex-1 py-3 bg-slate-700 text-slate-300 rounded-xl 
                  hover:bg-slate-600 transition-all btn-press flex items-center justify-center gap-2"
              >
                <span>🏳️</span>
                <span>放弃</span>
              </button>
              <button
                onClick={handleViewAnswer}
                className="flex-1 py-3 bg-amber-600/20 text-amber-400 border border-amber-600/30 
                  rounded-xl hover:bg-amber-600/30 transition-all btn-press flex items-center justify-center gap-2"
              >
                <span>👁️</span>
                <span>查看汤底</span>
              </button>
            </>
          ) : (
            <>
              <button
                onClick={handleBackToHome}
                className="flex-1 py-3 bg-slate-700 text-slate-300 rounded-xl 
                  hover:bg-slate-600 transition-all btn-press flex items-center justify-center gap-2"
              >
                <span>🏠</span>
                <span>返回大厅</span>
              </button>
              <button
                onClick={handleViewAnswer}
                className="flex-1 py-3 bg-amber-600 text-white rounded-xl 
                  hover:bg-amber-500 transition-all btn-press flex items-center justify-center gap-2"
              >
                <span>✨</span>
                <span>查看汤底</span>
              </button>
            </>
          )}
        </div>
      </div>

      {/* 放弃确认弹窗 */}
      {showGiveUpModal && (
        <div className="fixed inset-0 bg-black/70 backdrop-blur-sm flex items-center justify-center z-50 px-4">
          <div className="bg-slate-800 rounded-2xl p-6 max-w-sm w-full shadow-2xl border border-slate-700 animate-scale-in">
            <div className="text-center mb-4">
              <div className="text-4xl mb-3">🏳️</div>
              <h3 className="text-xl font-bold text-white mb-2">确认放弃？</h3>
              <p className="text-slate-400 text-sm">
                放弃后将无法继续提问，但可以查看汤底揭晓答案。
              </p>
            </div>
            <div className="flex gap-3">
              <button
                onClick={() => setShowGiveUpModal(false)}
                className="flex-1 py-3 bg-slate-700 text-slate-300 rounded-xl 
                  hover:bg-slate-600 transition-colors btn-press"
              >
                继续游戏
              </button>
              <button
                onClick={confirmGiveUp}
                className="flex-1 py-3 bg-red-600 text-white rounded-xl 
                  hover:bg-red-500 transition-colors btn-press"
              >
                确认放弃
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}

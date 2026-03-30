import { useState, useEffect } from 'react'
import { useParams, Link } from 'react-router-dom'
import { STORIES } from '../data/stories'

/**
 * 结果页面 - 汤底揭晓（带仪式感动画）
 */
export default function Result() {
  const { id } = useParams<{ id: string }>()
  const story = STORIES.find(s => s.id === id)
  
  // 动画状态
  const [stage, setStage] = useState(0)
  
  useEffect(() => {
    // 分阶段显示动画
    const timers = [
      setTimeout(() => setStage(1), 500),   // 显示标题
      setTimeout(() => setStage(2), 1500),  // 显示汤面
      setTimeout(() => setStage(3), 2500),  // 揭晓汤底
      setTimeout(() => setStage(4), 3500),  // 显示按钮
    ]
    
    return () => timers.forEach(clearTimeout)
  }, [])

  if (!story) {
    return (
      <div className="container mx-auto px-4 py-8 text-center">
        <p className="text-slate-400">故事不存在</p>
        <Link to="/" className="text-amber-400 hover:underline mt-4 inline-block">
          返回首页
        </Link>
      </div>
    )
  }

  return (
    <div className="min-h-screen flex flex-col items-center justify-center px-4 py-8">
      {/* 揭晓动画容器 */}
      <div className="max-w-2xl w-full">
        
        {/* 第一阶段：标题 */}
        <div className={`text-center mb-8 transition-all duration-700 ${
          stage >= 1 ? 'opacity-100 translate-y-0' : 'opacity-0 -translate-y-4'
        }`}>
          <div className="text-6xl mb-4">🎉</div>
          <h1 className="text-4xl font-bold text-amber-400 mb-2 tracking-wider">
            汤底揭晓
          </h1>
          <p className="text-xl text-slate-300">{story.title}</p>
        </div>

        {/* 第二阶段：汤面回顾 */}
        <div className={`bg-slate-800/80 rounded-lg p-6 mb-6 transition-all duration-700 ${
          stage >= 2 ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-4'
        }`}>
          <h2 className="text-sm font-bold text-slate-400 uppercase tracking-wider mb-3">
            📜 汤面回顾
          </h2>
          <p className="text-slate-300 leading-relaxed">{story.surface}</p>
        </div>

        {/* 第三阶段：汤底揭晓 - 重点仪式感 */}
        <div className={`relative overflow-hidden rounded-lg transition-all duration-1000 ${
          stage >= 3 ? 'opacity-100 scale-100' : 'opacity-0 scale-95'
        }`}>
          {/* 发光边框效果 */}
          <div className="absolute inset-0 bg-gradient-to-r from-amber-500 via-yellow-400 to-amber-500 opacity-50 blur-sm animate-pulse" />
          
          <div className="relative bg-slate-900 p-8 border-2 border-amber-400 rounded-lg">
            <div className="flex items-center justify-center mb-4">
              <span className="text-2xl">✨</span>
              <h2 className="text-xl font-bold text-amber-400 mx-2">
                真相大白
              </h2>
              <span className="text-2xl">✨</span>
            </div>
            
            {/* 汤底文字 - 打字机效果 */}
            <div className={`transition-all duration-500 ${
              stage >= 3 ? 'opacity-100' : 'opacity-0'
            }`}>
              <p className="text-lg text-slate-100 leading-loose text-center font-medium">
                {story.bottom}
              </p>
            </div>
          </div>
        </div>

        {/* 第四阶段：操作按钮 */}
        <div className={`flex gap-4 mt-8 transition-all duration-700 ${
          stage >= 4 ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-4'
        }`}>
          <Link 
            to="/"
            className="flex-1 py-4 bg-slate-700 text-slate-200 rounded-lg hover:bg-slate-600 transition-all duration-300 text-center font-medium text-lg shadow-lg hover:shadow-xl"
          >
            🏠 返回大厅
          </Link>
          <Link 
            to={`/game/${story.id}`}
            className="flex-1 py-4 bg-amber-600 text-white rounded-lg hover:bg-amber-500 transition-all duration-300 text-center font-medium text-lg shadow-lg hover:shadow-amber-500/25 hover:shadow-xl"
          >
            🔄 再来一局
          </Link>
        </div>

        {/* 提示语 */}
        <p className={`text-center text-slate-500 mt-6 transition-all duration-500 ${
          stage >= 4 ? 'opacity-100' : 'opacity-0'
        }`}>
          🎭 每个谜题背后，都藏着人性的复杂
        </p>
      </div>
    </div>
  )
}

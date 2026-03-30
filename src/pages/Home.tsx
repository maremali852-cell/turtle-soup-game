import { useState } from 'react'
import { STORIES } from '../data/stories'
import GameCard from '../components/GameCard'

/**
 * 首页 - 游戏大厅
 */
export default function Home() {
  const [selectedDifficulty, setSelectedDifficulty] = useState<string>('all')

  // 过滤故事
  const filteredStories = selectedDifficulty === 'all' 
    ? STORIES 
    : STORIES.filter(s => s.difficulty === selectedDifficulty)

  return (
    <div className="min-h-screen flex flex-col">
      {/* 页面标题区域 */}
      <div className="text-center py-12 px-4">
        <div className="animate-fade-in-up">
          <h1 className="text-5xl sm:text-6xl font-bold text-amber-400 mb-4 tracking-wider">
            🐢 AI海龟汤
          </h1>
          <p className="text-slate-400 text-lg max-w-xl mx-auto mb-6 leading-relaxed">
            在迷雾中寻找真相，用提问揭开谜底。
            <br />
            <span className="text-slate-500">AI主持人将用"是"、"否"、"无关"引导你走向答案。</span>
          </p>
        </div>
        
        {/* 游戏规则提示 */}
        <div className="bg-slate-800/50 backdrop-blur-sm rounded-xl p-5 max-w-md mx-auto border border-slate-700 animate-fade-in-up"
          style={{ animationDelay: '0.2s' }}>
          <p className="text-slate-300 text-sm leading-relaxed">
            <span className="text-amber-400 font-bold">游戏规则：</span>
            <span className="text-slate-400"> 选择故事 → 阅读汤面 → 提问推理 → 揭晓汤底</span>
          </p>
        </div>

        {/* 难度筛选 */}
        <div className="flex justify-center gap-2 mt-6 animate-fade-in-up" style={{ animationDelay: '0.3s' }}>
          {[
            { value: 'all', label: '全部' },
            { value: 'easy', label: '简单', color: 'bg-green-600' },
            { value: 'medium', label: '中等', color: 'bg-yellow-600' },
            { value: 'hard', label: '困难', color: 'bg-red-600' }
          ].map(filter => (
            <button
              key={filter.value}
              onClick={() => setSelectedDifficulty(filter.value)}
              className={`px-4 py-2 rounded-lg text-sm font-medium transition-all btn-press
                ${selectedDifficulty === filter.value 
                  ? `${filter.color || 'bg-amber-600'} text-white` 
                  : 'bg-slate-700 text-slate-400 hover:bg-slate-600'
                }`}
            >
              {filter.label}
            </button>
          ))}
        </div>
      </div>
      
      {/* 游戏卡片列表 */}
      <div className="container mx-auto px-4 pb-8 flex-1">
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5">
          {filteredStories.map((story, index) => (
            <GameCard key={story.id} story={story} index={index} />
          ))}
        </div>

        {/* 空状态 */}
        {filteredStories.length === 0 && (
          <div className="text-center py-12">
            <p className="text-slate-500">暂无该难度的故事</p>
          </div>
        )}
      </div>
      
      {/* 页脚 */}
      <footer className="text-center py-6 text-slate-500 text-sm border-t border-slate-800 bg-slate-900/50">
        <p className="animate-pulse">🎭 每个故事背后，都藏着一个令人意想不到的真相</p>
      </footer>
    </div>
  )
}

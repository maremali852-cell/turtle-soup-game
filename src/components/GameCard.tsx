import { Link } from 'react-router-dom'
import { TStory, TDifficulty } from '../types'

/**
 * 难度对应的样式配置
 */
const DIFFICULTY_STYLES: Record<TDifficulty, string> = {
  easy: 'bg-green-600/80',
  medium: 'bg-yellow-600/80',
  hard: 'bg-red-600/80'
}

/**
 * 难度对应的中文名称
 */
const DIFFICULTY_LABELS: Record<TDifficulty, string> = {
  easy: '简单',
  medium: '中等',
  hard: '困难'
}

/**
 * GameCard 组件的 Props
 */
interface TGameCardProps {
  story: TStory
  index?: number
}

/**
 * 游戏卡片组件
 * 显示单个海龟汤故事的卡片，点击可进入游戏
 */
export default function GameCard({ story, index = 0 }: TGameCardProps) {
  return (
    <Link 
      to={`/game/${story.id}`}
      className="group block p-6 bg-slate-800/80 backdrop-blur-sm rounded-xl shadow-lg 
        border border-slate-700 hover:border-amber-400/50 
        transition-all duration-300 card-hover overflow-hidden relative
        animate-fade-in-up"
      style={{ animationDelay: `${index * 0.1}s` }}
    >
      {/* 悬浮光效 */}
      <div className="absolute inset-0 bg-gradient-to-r from-amber-400/0 via-amber-400/5 to-amber-400/0 
        translate-x-[-100%] group-hover:translate-x-[100%] transition-transform duration-700" />
      
      {/* 标题和难度标签 */}
      <div className="flex justify-between items-start mb-3 relative">
        <h3 className="text-lg font-bold text-amber-400 group-hover:text-amber-300 transition-colors">
          {story.title}
        </h3>
        <span className={`px-2.5 py-1 rounded-full text-xs text-white font-medium 
          ${DIFFICULTY_STYLES[story.difficulty]} transition-transform group-hover:scale-105`}>
          {DIFFICULTY_LABELS[story.difficulty]}
        </span>
      </div>
      
      {/* 汤面预览 */}
      <p className="text-slate-400 text-sm line-clamp-2 leading-relaxed group-hover:text-slate-300 transition-colors">
        {story.surface}
      </p>
      
      {/* 底部提示 */}
      <div className="mt-4 flex items-center text-slate-500 text-xs group-hover:text-amber-400 transition-colors">
        <span>点击开始推理</span>
        <svg className="w-4 h-4 ml-1 transform group-hover:translate-x-1 transition-transform" 
          fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
        </svg>
      </div>
    </Link>
  )
}

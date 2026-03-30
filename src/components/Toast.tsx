import { useEffect, useState } from 'react'

/**
 * Toast 类型
 */
export type TToastType = 'success' | 'error' | 'warning' | 'info'

/**
 * Toast Props
 */
interface TToastProps {
  message: string
  type?: TToastType
  duration?: number
  onClose: () => void
}

/**
 * Toast 图标映射
 */
const TOAST_ICONS: Record<TToastType, string> = {
  success: '✅',
  error: '❌',
  warning: '⚠️',
  info: 'ℹ️'
}

/**
 * Toast 样式映射
 */
const TOAST_STYLES: Record<TToastType, string> = {
  success: 'bg-green-600/90 border-green-500',
  error: 'bg-red-600/90 border-red-500',
  warning: 'bg-yellow-600/90 border-yellow-500',
  info: 'bg-blue-600/90 border-blue-500'
}

/**
 * Toast 提示组件
 */
export default function Toast({ 
  message, 
  type = 'info', 
  duration = 3000, 
  onClose 
}: TToastProps) {
  const [isVisible, setIsVisible] = useState(false)
  const [isLeaving, setIsLeaving] = useState(false)

  useEffect(() => {
    // 入场动画
    requestAnimationFrame(() => {
      setIsVisible(true)
    })

    // 自动关闭
    const timer = setTimeout(() => {
      setIsLeaving(true)
      setTimeout(onClose, 300)
    }, duration)

    return () => clearTimeout(timer)
  }, [duration, onClose])

  return (
    <div 
      className={`fixed top-4 left-1/2 -translate-x-1/2 z-50 px-4 py-3 rounded-lg 
        border shadow-lg text-white text-sm font-medium
        transition-all duration-300 max-w-[90vw]
        ${TOAST_STYLES[type]}
        ${isVisible && !isLeaving ? 'opacity-100 translate-y-0' : 'opacity-0 -translate-y-2'}
      `}
    >
      <span className="mr-2">{TOAST_ICONS[type]}</span>
      {message}
    </div>
  )
}

/**
 * Toast 管理器 Hook
 */
export function useToast() {
  const [toast, setToast] = useState<{
    message: string
    type: TToastType
    id: number
  } | null>(null)

  const showToast = (message: string, type: TToastType = 'info') => {
    setToast({ message, type, id: Date.now() })
  }

  const hideToast = () => {
    setToast(null)
  }

  return { toast, showToast, hideToast }
}

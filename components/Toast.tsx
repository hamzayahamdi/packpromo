import { useEffect } from 'react'

export type ToastType = 'success' | 'error' | 'info' | 'warning'

interface ToastProps {
  isVisible?: boolean
  message: string
  type?: ToastType
  onClose?: () => void
}

export default function Toast({ isVisible = true, message, type = 'info', onClose }: ToastProps) {
  useEffect(() => {
    if (isVisible && onClose) {
      const timer = setTimeout(onClose, 3000)
      return () => clearTimeout(timer)
    }
  }, [isVisible, onClose])

  if (!isVisible) return null

  const bgColor = {
    success: 'bg-green-600',
    error: 'bg-red-600',
    info: 'bg-blue-600',
    warning: 'bg-yellow-600'
  }[type]

  return (
    <div className={`fixed bottom-4 right-4 ${bgColor} text-white px-4 py-2 rounded-lg shadow-lg z-50 flex items-center gap-2`}>
      {message}
      {onClose && (
        <button
          onClick={onClose}
          className="ml-2 hover:opacity-80"
        >
          ×
        </button>
      )}
    </div>
  )
} 
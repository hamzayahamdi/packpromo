import { motion, AnimatePresence } from 'framer-motion'
import { AlertTriangle } from 'lucide-react'

interface ConfirmDialogProps {
  isOpen: boolean
  title: string
  message: string
  confirmLabel?: string
  cancelLabel?: string
  onConfirm: () => void
  onCancel: () => void
  type?: 'danger' | 'warning' | 'info'
}

export default function ConfirmDialog({
  isOpen,
  title,
  message,
  confirmLabel = 'Confirm',
  cancelLabel = 'Cancel',
  onConfirm,
  onCancel,
  type = 'danger'
}: ConfirmDialogProps) {
  if (!isOpen) return null

  const colors = {
    danger: {
      bg: 'bg-red-50',
      border: 'border-red-100',
      text: 'text-red-800',
      button: 'bg-red-600 hover:bg-red-700',
      icon: 'text-red-600'
    },
    warning: {
      bg: 'bg-yellow-50',
      border: 'border-yellow-100',
      text: 'text-yellow-800',
      button: 'bg-yellow-600 hover:bg-yellow-700',
      icon: 'text-yellow-600'
    },
    info: {
      bg: 'bg-blue-50',
      border: 'border-blue-100',
      text: 'text-blue-800',
      button: 'bg-blue-600 hover:bg-blue-700',
      icon: 'text-blue-600'
    }
  }[type]

  return (
    <AnimatePresence>
      <div className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center p-4 z-[60]">
        <motion.div
          initial={{ opacity: 0, scale: 0.95 }}
          animate={{ opacity: 1, scale: 1 }}
          exit={{ opacity: 0, scale: 0.95 }}
          className={`${colors.bg} ${colors.border} border rounded-lg shadow-lg max-w-md w-full overflow-hidden`}
        >
          <div className="p-6">
            <div className="flex items-center gap-4">
              <div className={`${colors.icon} p-2 rounded-full bg-white`}>
                <AlertTriangle size={24} />
              </div>
              <div>
                <h3 className={`text-lg font-semibold ${colors.text}`}>
                  {title}
                </h3>
                <p className="mt-2 text-gray-600">
                  {message}
                </p>
              </div>
            </div>
          </div>
          <div className="border-t px-6 py-4 bg-white flex items-center justify-end gap-3">
            <button
              type="button"
              onClick={onCancel}
              className="px-4 py-2 text-gray-700 hover:text-gray-900 transition-colors"
            >
              {cancelLabel}
            </button>
            <button
              onClick={onConfirm}
              className={`px-4 py-2 text-white rounded-lg transition-colors ${colors.button}`}
            >
              {confirmLabel}
            </button>
          </div>
        </motion.div>
      </div>
    </AnimatePresence>
  )
} 
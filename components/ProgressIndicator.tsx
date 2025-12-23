'use client'

import { motion } from 'framer-motion'
import { Calendar, Loader2 } from 'lucide-react'

interface ProgressIndicatorProps {
  progress: {
    step: number
    total: number
    message: string
    month: string
  }
}

export default function ProgressIndicator({ progress }: ProgressIndicatorProps) {
  const percentage = (progress.step / progress.total) * 100

  return (
    <div className="glass-effect rounded-2xl p-6">
      <div className="flex items-center gap-4 mb-4">
        <div className="relative">
          <Loader2 className="animate-spin text-orange-500" size={24} />
        </div>
        <div className="flex-1">
          <p className="text-white font-medium">{progress.message}</p>
          {progress.month && (
            <p className="text-gray-400 text-sm mt-1">Analyzing {progress.month}...</p>
          )}
        </div>
      </div>
      
      <div className="relative h-2 bg-white/5 rounded-full overflow-hidden">
        <motion.div
          className="absolute inset-y-0 left-0 bg-gradient-to-r from-orange-500 via-red-500 to-pink-500"
          initial={{ width: 0 }}
          animate={{ width: `${percentage}%` }}
          transition={{ duration: 0.3, ease: 'easeOut' }}
        />
      </div>
      
      <div className="flex justify-between items-center mt-2">
        <span className="text-xs text-gray-400">
          Step {progress.step} of {progress.total}
        </span>
        <span className="text-xs text-gray-400">
          {Math.round(percentage)}%
        </span>
      </div>
    </div>
  )
}


'use client'

import { useState, useEffect } from 'react'
import { motion } from 'framer-motion'
import { Loader2 } from 'lucide-react'

interface ProgressIndicatorProps {
  progress: {
    step: number
    total: number
    message: string
    month: string
  }
}

export default function ProgressIndicator({ progress }: ProgressIndicatorProps) {
  const [elapsedTime, setElapsedTime] = useState(0)
  const [dots, setDots] = useState('')
  const percentage = (progress.step / progress.total) * 100

  // Timer to show elapsed time
  useEffect(() => {
    const timer = setInterval(() => {
      setElapsedTime(prev => prev + 1)
    }, 1000)
    return () => clearInterval(timer)
  }, [])

  // Animated dots to show activity
  useEffect(() => {
    const timer = setInterval(() => {
      setDots(prev => prev.length >= 3 ? '' : prev + '.')
    }, 500)
    return () => clearInterval(timer)
  }, [])

  const formatTime = (seconds: number) => {
    const mins = Math.floor(seconds / 60)
    const secs = seconds % 60
    return mins > 0 ? `${mins}m ${secs}s` : `${secs}s`
  }

  return (
    <div className="glass-effect rounded-2xl p-6">
      <div className="flex items-center gap-4 mb-4">
        <div className="relative">
          <Loader2 className="animate-spin text-orange-500" size={24} />
          {/* Pulse effect to show activity */}
          <motion.div
            className="absolute inset-0 rounded-full bg-orange-500/20"
            animate={{ scale: [1, 1.5, 1], opacity: [0.5, 0, 0.5] }}
            transition={{ duration: 2, repeat: Infinity }}
          />
        </div>
        <div className="flex-1">
          <p className="text-white font-medium">
            {progress.message || 'Processing'}{dots}
          </p>
          <p className="text-gray-500 text-xs mt-1">
            {progress.step === 1 ? 'Grok is analyzing posts - this may take 1-2 minutes' :
             progress.step === 2 ? 'Generating your personalized wrapped...' :
             progress.step === 3 ? 'Almost done!' :
             'Starting up...'}
          </p>
        </div>
        <div className="text-right">
          <p className="text-orange-400 text-sm font-mono">{formatTime(elapsedTime)}</p>
          <p className="text-gray-500 text-xs">elapsed</p>
        </div>
      </div>
      
      <div className="relative h-2 bg-white/5 rounded-full overflow-hidden">
        <motion.div
          className="absolute inset-y-0 left-0 bg-gradient-to-r from-orange-500 via-red-500 to-pink-500"
          initial={{ width: 0 }}
          animate={{ width: `${percentage}%` }}
          transition={{ duration: 0.3, ease: 'easeOut' }}
        />
        {/* Shimmer effect to show activity */}
        <motion.div
          className="absolute inset-y-0 w-20 bg-gradient-to-r from-transparent via-white/20 to-transparent"
          animate={{ x: ['-100%', '500%'] }}
          transition={{ duration: 2, repeat: Infinity, ease: 'linear' }}
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

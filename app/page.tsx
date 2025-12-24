'use client'

import { useState, useEffect, useMemo } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { Loader2, TrendingUp, Heart, Sparkles, ChevronRight, BarChart3, MessageCircle, Zap, Star, Flame } from 'lucide-react'
import WrappedDisplay from '@/components/WrappedDisplay'
import ProgressIndicator from '@/components/ProgressIndicator'

// =============================================================================
// TYPE DEFINITIONS (matching new content-focused backend schema)
// =============================================================================

interface PersonalityArchetype {
  archetype: string
  description: string
  traits: string[]
  spirit_emoji: string
}

interface VibeAnalysis {
  positive_percentage: number
  neutral_percentage: number
  negative_percentage: number
  overall_vibe: string
  vibe_description: string
}

interface ThemeData {
  theme: string
  weight: number
  sample_context: string
}

interface VoiceAnalysis {
  style_summary: string
  vocabulary_level: string
  tone: string
  signature_phrases: string[]
  emoji_style: string
  post_length_style: string
}

interface ContentMixCategory {
  category: string
  percentage: number
}

interface ContentMix {
  categories: ContentMixCategory[]
  primary_mode: string
  engagement_style: string
}

interface HighlightMoment {
  title: string
  description: string
  post_snippet: string
  time_period: string
}

interface GreatestHit {
  content: string
  category: string
  context: string
}

interface WrappedData {
  personality?: PersonalityArchetype
  vibe?: VibeAnalysis
  themes?: ThemeData[]
  voice?: VoiceAnalysis
  content_mix?: ContentMix
  highlights?: HighlightMoment[]
  greatest_hits?: GreatestHit[]
  year_story?: string
}

// Particle component for background ambience
const Particle = ({ delay, duration, x, y, size }: { delay: number; duration: number; x: string; y: string; size: number }) => (
  <motion.div
    initial={{ opacity: 0, scale: 0 }}
    animate={{ 
      opacity: [0, 1, 0.5, 1, 0],
      scale: [0, 1, 0.8, 1.2, 0],
    }}
    transition={{ 
      duration,
      delay,
      repeat: Infinity,
      ease: "easeInOut"
    }}
    className="absolute rounded-full bg-white pointer-events-none"
    style={{ 
      left: x, 
      top: y, 
      width: size, 
      height: size,
      boxShadow: `0 0 ${size * 2}px ${size}px rgba(255,255,255,0.3)`
    }}
  />
)

// Floating icon component for background ambience
const FloatingIcon = ({ icon: Icon, delay, x, y, color, size = 32 }: { icon: React.ElementType; delay: number; x: string; y: string; color: string; size?: number }) => (
  <motion.div
    initial={{ opacity: 0, y: 20 }}
    animate={{ 
      opacity: [0.15, 0.4, 0.15], 
      y: [0, -30, 0],
      rotate: [0, 15, -15, 0],
      scale: [1, 1.1, 1]
    }}
    transition={{ 
      duration: 8, 
      delay, 
      repeat: Infinity,
      ease: "easeInOut" 
    }}
    className={`absolute ${color} pointer-events-none`}
    style={{ left: x, top: y }}
  >
    <Icon size={size} />
  </motion.div>
)

// Animated ring component
const AnimatedRing = ({ size, delay, opacity }: { size: string; delay: number; opacity: number }) => (
  <motion.div
    initial={{ opacity: 0, scale: 0.8 }}
    animate={{ 
      opacity: [0, opacity, 0],
      scale: [0.8, 1.2, 0.8],
      rotate: [0, 180, 360]
    }}
    transition={{ duration: 15, delay, repeat: Infinity, ease: "linear" }}
    className="absolute border border-white/10 rounded-full pointer-events-none"
    style={{ 
      width: size, 
      height: size,
      left: '50%',
      top: '50%',
      transform: 'translate(-50%, -50%)'
    }}
  />
)

export default function Home() {
  const [username, setUsername] = useState('')
  const [loading, setLoading] = useState(false)
  const [progress, setProgress] = useState({ step: 0, total: 3, message: '', month: '' })
  const [wrappedData, setWrappedData] = useState<WrappedData | null>(null)
  const [error, setError] = useState<string | null>(null)
  const [analysisChunks, setAnalysisChunks] = useState<string[]>([])
  const [mounted, setMounted] = useState(false)
  const [inputFocused, setInputFocused] = useState(false)

  useEffect(() => {
    setMounted(true)
  }, [])

  // Generate random particles
  const particles = useMemo(() => 
    Array.from({ length: 30 }, (_, i) => ({
      id: i,
      x: `${Math.random() * 100}%`,
      y: `${Math.random() * 100}%`,
      delay: Math.random() * 5,
      duration: 3 + Math.random() * 4,
      size: 1 + Math.random() * 2,
    }))
  , [])

  const handleGenerate = async () => {
    if (!username.trim()) {
      setError('Please enter a username')
      return
    }

    setLoading(true)
    setError(null)
    setWrappedData(null)
    setAnalysisChunks([])
    setProgress({ step: 0, total: 3, message: '🚀 Initializing...', month: '' })

    try {
      const cleanUsername = username.replace('@', '').trim()
      
      const isLocalDev = typeof window !== 'undefined' && window.location.hostname === 'localhost'
      const apiUrl = isLocalDev 
        ? 'http://localhost:5328/api/wrapped/stream'
        : '/api/wrapped/stream'
      
      const response = await fetch(apiUrl, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ username: cleanUsername }),
      })

      if (!response.ok) {
        throw new Error('Failed to generate wrapped')
      }

      const reader = response.body?.getReader()
      const decoder = new TextDecoder()

      if (!reader) {
        throw new Error('No response stream available')
      }

      let buffer = ''
      let receivedComplete = false

      while (true) {
        const { done, value } = await reader.read()
        if (done) break

        buffer += decoder.decode(value, { stream: true })
        const lines = buffer.split('\n')
        buffer = lines.pop() || ''

        for (const line of lines) {
          if (line.startsWith('data: ')) {
            try {
              const data = JSON.parse(line.slice(6))
              
              if (data.type === 'progress') {
                setProgress({
                  step: data.step ?? 0,
                  total: data.total ?? 3,
                  message: data.message || '',
                  month: data.month || ''
                })
              } else if (data.type === 'analysis_chunk') {
                setAnalysisChunks(prev => [...prev, data.content])
              } else if (data.type === 'complete') {
                receivedComplete = true
                setWrappedData(data.data)
                setLoading(false)
              } else if (data.type === 'error') {
                throw new Error(data.error || 'An error occurred during analysis')
              }
            } catch (e) {
              if (!(e instanceof Error && e.message.includes('An error occurred'))) {
                console.error('Error parsing stream data:', e, 'Line:', line)
              } else {
                throw e
              }
            }
          }
        }
      }
      
      if (buffer.trim() && buffer.startsWith('data: ')) {
        try {
          const data = JSON.parse(buffer.slice(6))
          if (data.type === 'complete') {
            receivedComplete = true
            setWrappedData(data.data)
            setLoading(false)
          } else if (data.type === 'error') {
            throw new Error(data.error || 'An error occurred during analysis')
          }
        } catch (e) {
          console.error('Error parsing final buffer:', e)
        }
      }
      
      if (!receivedComplete) {
        throw new Error('Analysis stream ended unexpectedly. Please try again.')
      }
    } catch (err: unknown) {
      const errorMessage = err instanceof Error ? err.message : 'An error occurred'
      setError(errorMessage)
      setLoading(false)
    }
  }

  if (!mounted) return null

  return (
    <main className={`noise-overlay min-h-screen bg-black text-white selection:bg-orange-500/30 ${wrappedData ? 'overflow-hidden h-screen' : 'overflow-x-hidden'}`}>
      
      {/* Background Ambience - Only show on landing */}
      {!wrappedData && (
        <div className="fixed inset-0 pointer-events-none overflow-hidden">
          {/* Deep Gradient Base */}
          <div className="absolute inset-0 bg-gradient-to-br from-black via-gray-950 to-black" />
          
          {/* Animated Mesh Grid */}
          <div className="absolute inset-0 bg-[linear-gradient(to_right,#80808008_1px,transparent_1px),linear-gradient(to_bottom,#80808008_1px,transparent_1px)] bg-[size:32px_32px]" />
          <div className="absolute inset-0 bg-[linear-gradient(to_right,#80808012_1px,transparent_1px),linear-gradient(to_bottom,#80808012_1px,transparent_1px)] bg-[size:128px_128px]" />
          
          {/* Vignette */}
          <div className="absolute inset-0 bg-gradient-to-t from-black via-transparent to-black opacity-60" />
          <div className="absolute inset-0 bg-gradient-to-r from-black via-transparent to-black opacity-40" />
          
          {/* Animated Orbs */}
          <motion.div 
            animate={{ 
              scale: [1, 1.2, 1],
              opacity: [0.15, 0.25, 0.15]
            }}
            transition={{ duration: 8, repeat: Infinity, ease: "easeInOut" }}
            className="absolute top-[-20%] left-[-15%] w-[60vw] h-[60vw] bg-orange-500 rounded-full blur-[150px]" 
          />
          <motion.div 
            animate={{ 
              scale: [1.2, 1, 1.2],
              opacity: [0.12, 0.2, 0.12]
            }}
            transition={{ duration: 10, repeat: Infinity, ease: "easeInOut", delay: 1 }}
            className="absolute bottom-[-20%] right-[-15%] w-[50vw] h-[50vw] bg-pink-600 rounded-full blur-[150px]" 
          />
          <motion.div 
            animate={{ 
              scale: [1, 1.3, 1],
              opacity: [0.08, 0.15, 0.08]
            }}
            transition={{ duration: 12, repeat: Infinity, ease: "easeInOut", delay: 2 }}
            className="absolute top-[40%] left-[30%] w-[40vw] h-[40vw] bg-red-500 rounded-full blur-[180px]" 
          />
          
          {/* Particles */}
          {particles.map((p) => (
            <Particle key={p.id} {...p} />
          ))}
          
          {/* Floating Icons */}
          <FloatingIcon icon={Heart} delay={0} x="12%" y="18%" color="text-red-500/30" size={28} />
          <FloatingIcon icon={BarChart3} delay={1.2} x="88%" y="12%" color="text-orange-500/25" size={24} />
          <FloatingIcon icon={MessageCircle} delay={0.6} x="82%" y="72%" color="text-blue-500/25" size={26} />
          <FloatingIcon icon={TrendingUp} delay={1.8} x="8%" y="78%" color="text-emerald-500/25" size={22} />
          <FloatingIcon icon={Zap} delay={2.4} x="75%" y="35%" color="text-yellow-500/20" size={20} />
          <FloatingIcon icon={Star} delay={0.3} x="20%" y="55%" color="text-purple-500/20" size={18} />
          <FloatingIcon icon={Flame} delay={1.5} x="65%" y="85%" color="text-orange-400/20" size={24} />
        </div>
      )}

      <div className={wrappedData ? "w-full h-full" : "relative z-10 min-h-screen flex flex-col items-center justify-center p-4 md:p-8"}>
        <AnimatePresence mode="wait">
          {!wrappedData ? (
            <motion.div
              key="landing"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.95, filter: "blur(10px)" }}
              className="w-full max-w-6xl mx-auto grid md:grid-cols-2 gap-16 items-center"
            >
              {/* Left Column: Input Area */}
              <div className="space-y-10 z-20">
                <div className="space-y-4">
                  <motion.div
                    initial={{ opacity: 0, x: -20, scale: 0.9 }}
                    animate={{ opacity: 1, x: 0, scale: 1 }}
                    transition={{ delay: 0.1, type: "spring", stiffness: 200 }}
                    className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-gradient-to-r from-orange-500/10 to-pink-500/10 border border-orange-500/20 text-xs font-semibold text-orange-400 backdrop-blur-sm"
                  >
                    <motion.div
                      animate={{ rotate: [0, 15, -15, 0] }}
                      transition={{ duration: 2, repeat: Infinity, ease: "easeInOut" }}
                    >
                      <Sparkles size={14} className="text-orange-400" />
                    </motion.div>
                    <span>Powered by Grok AI</span>
                  </motion.div>
                  
                  <motion.h1 
                    initial={{ opacity: 0, y: 30 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: 0.2, type: "spring", stiffness: 100 }}
                    className="text-5xl md:text-7xl lg:text-8xl font-black tracking-tight leading-[0.9]"
                  >
                    Your Year <br />
                    <span className="gradient-text-animated">Unwrapped.</span>
                  </motion.h1>
                  
                  <motion.p 
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: 0.35 }}
                    className="text-lg md:text-xl text-gray-400 max-w-md leading-relaxed"
                  >
                    Discover your 2025 X personality. Your voice, your vibe, your greatest hits—all analyzed by Grok AI.
                  </motion.p>
                </div>

                <motion.div
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: 0.45 }}
                  className="space-y-4"
                >
                  <div className="relative group max-w-md">
                    {/* Animated gradient border */}
                    <motion.div 
                      className="absolute -inset-[2px] bg-gradient-to-r from-orange-500 via-red-500 to-pink-500 rounded-2xl blur-sm"
                      animate={{
                        opacity: inputFocused ? 0.8 : 0.3,
                        scale: inputFocused ? 1.02 : 1,
                      }}
                      transition={{ duration: 0.3 }}
                      style={{
                        background: 'linear-gradient(90deg, #f97316, #ef4444, #ec4899, #f97316)',
                        backgroundSize: '300% 100%',
                        animation: 'gradient-flow 3s linear infinite',
                      }}
                    />
                    <div className="relative flex items-center bg-black/90 backdrop-blur-xl rounded-2xl border border-white/10 p-2 pr-2">
                      <span className="pl-4 text-gray-500 font-medium select-none text-lg">@</span>
                      <input
                        type="text"
                        value={username}
                        onChange={(e) => setUsername(e.target.value)}
                        onKeyPress={(e) => e.key === 'Enter' && !loading && handleGenerate()}
                        onFocus={() => setInputFocused(true)}
                        onBlur={() => setInputFocused(false)}
                        placeholder="username"
                        className="flex-1 bg-transparent border-none text-white placeholder-gray-600 focus:outline-none focus:ring-0 px-2 py-3.5 text-lg font-medium"
                        disabled={loading}
                      />
                      <motion.button
                        onClick={handleGenerate}
                        disabled={loading || !username.trim()}
                        whileHover={{ scale: 1.05 }}
                        whileTap={{ scale: 0.95 }}
                        className="bg-white text-black p-3.5 rounded-xl hover:bg-gray-100 transition-all disabled:opacity-50 disabled:cursor-not-allowed shadow-lg hover:shadow-white/20"
                      >
                        {loading ? (
                          <Loader2 className="animate-spin" size={22} />
                        ) : (
                          <ChevronRight size={22} strokeWidth={2.5} />
                        )}
                      </motion.button>
                    </div>
                  </div>
                  
                  {error && (
                    <motion.p 
                      initial={{ opacity: 0, x: -10 }} 
                      animate={{ opacity: 1, x: 0 }} 
                      className="text-red-400 text-sm pl-2 flex items-center gap-2"
                    >
                      <span className="w-1.5 h-1.5 bg-red-400 rounded-full" />
                      {error}
                    </motion.p>
                  )}
                </motion.div>

                {/* Progress UI when loading */}
                <AnimatePresence>
                  {loading && (
                    <motion.div
                      initial={{ opacity: 0, height: 0 }}
                      animate={{ opacity: 1, height: 'auto' }}
                      exit={{ opacity: 0, height: 0 }}
                      className="max-w-md overflow-hidden"
                    >
                      <ProgressIndicator progress={progress} />
                      
                      {/* Live Analysis Feed */}
                      <div className="mt-4 h-32 overflow-hidden relative rounded-xl bg-white/5 border border-white/5 p-3">
                        <div className="absolute inset-0 bg-gradient-to-t from-black via-transparent to-transparent z-10" />
                        <div className="flex flex-col-reverse h-full">
                          {analysisChunks.slice(-5).reverse().map((chunk, i) => (
                            <motion.p 
                              key={i}
                              initial={{ opacity: 0, x: -10 }}
                              animate={{ opacity: 1 - i * 0.15, x: 0 }}
                              className="text-xs text-gray-500 font-mono truncate py-1"
                            >
                              <span className="text-orange-500/60 mr-2">▸</span>
                              {chunk.slice(0, 55)}...
                            </motion.p>
                          ))}
                        </div>
                      </div>
                    </motion.div>
                  )}
                </AnimatePresence>

                {/* Social proof / Stats hint */}
                <motion.div
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  transition={{ delay: 0.7 }}
                  className="flex items-center gap-6 text-sm text-gray-600"
                >
                  <div className="flex -space-x-2">
                    {[...Array(4)].map((_, i) => (
                      <div 
                        key={i}
                        className="w-7 h-7 rounded-full bg-gradient-to-br from-gray-700 to-gray-800 border-2 border-black flex items-center justify-center text-[10px]"
                      >
                        {['🔥', '✨', '💫', '⚡'][i]}
                      </div>
                    ))}
                  </div>
                  <span className="text-gray-500">Join thousands discovering their X personality</span>
                </motion.div>
              </div>

              {/* Right Column: Visual Preview */}
              <div className="hidden md:flex items-center justify-center relative">
                {/* Animated rings behind the phone */}
                <AnimatedRing size="120%" delay={0} opacity={0.1} />
                <AnimatedRing size="140%" delay={2} opacity={0.08} />
                <AnimatedRing size="160%" delay={4} opacity={0.05} />
                
                <motion.div
                  initial={{ opacity: 0, rotateY: 25, x: 60 }}
                  animate={{ opacity: 1, rotateY: 0, x: 0 }}
                  transition={{ delay: 0.5, duration: 1.2, type: "spring", stiffness: 50 }}
                  className="relative z-10"
                >
                  {/* Phone glow */}
                  <div className="absolute -inset-4 bg-gradient-to-tr from-orange-500/20 via-transparent to-pink-500/20 rounded-[3rem] blur-2xl" />
                  
                  {/* Phone frame */}
                  <div className="relative w-72 lg:w-80 aspect-[9/16] bg-gradient-to-b from-gray-900 to-black border border-white/10 rounded-[2.5rem] p-5 shadow-2xl overflow-hidden">
                    {/* Screen glare */}
                    <div className="absolute top-0 left-0 right-0 h-40 bg-gradient-to-b from-white/5 to-transparent pointer-events-none" />
                    
                    {/* Notch */}
                    <div className="absolute top-3 left-1/2 -translate-x-1/2 w-24 h-6 bg-black rounded-full" />
                    
                    {/* Content area */}
                    <div className="relative z-10 h-full flex flex-col items-center justify-between py-10">
                      {/* Status bar placeholder */}
                      <div className="w-10 h-1 bg-white/20 rounded-full" />
                      
                      {/* Main hero */}
                      <div className="text-center space-y-3 relative">
                        <motion.div 
                          animate={{ 
                            scale: [1, 1.1, 1],
                            opacity: [0.4, 0.7, 0.4]
                          }}
                          transition={{ duration: 3, repeat: Infinity, ease: "easeInOut" }}
                          className="w-24 h-24 rounded-full bg-gradient-to-tr from-orange-500 to-pink-500 mx-auto blur-2xl absolute top-0 left-1/2 -translate-x-1/2"
                        />
                        <motion.h3 
                          className="text-5xl font-black text-white relative z-10"
                          animate={{ 
                            textShadow: [
                              '0 0 20px rgba(249,115,22,0.3)',
                              '0 0 40px rgba(249,115,22,0.5)',
                              '0 0 20px rgba(249,115,22,0.3)'
                            ]
                          }}
                          transition={{ duration: 2, repeat: Infinity }}
                        >
                          2025
                        </motion.h3>
                        <p className="text-gray-500 text-xs font-semibold tracking-[0.3em] uppercase">Wrapped</p>
                      </div>

                      {/* Preview cards */}
                      <div className="w-full space-y-2.5 px-1">
                        <motion.div 
                          initial={{ x: 20, opacity: 0 }}
                          animate={{ x: 0, opacity: 1 }}
                          transition={{ delay: 0.8 }}
                          className="h-20 bg-white/5 rounded-2xl border border-white/5 p-3 flex items-center gap-3 backdrop-blur-sm"
                        >
                          <div className="w-11 h-11 rounded-xl bg-gradient-to-br from-red-500/30 to-red-600/20 flex items-center justify-center border border-red-500/20">
                            <Heart size={18} className="text-red-400" />
                          </div>
                          <div className="flex-1 space-y-1.5">
                            <div className="h-2 w-20 bg-white/20 rounded-full" />
                            <div className="h-2 w-12 bg-white/10 rounded-full" />
                          </div>
                        </motion.div>
                        
                        <motion.div 
                          initial={{ x: 20, opacity: 0 }}
                          animate={{ x: 0, opacity: 1 }}
                          transition={{ delay: 0.95 }}
                          className="h-20 bg-white/5 rounded-2xl border border-white/5 p-3 flex items-center gap-3 backdrop-blur-sm"
                        >
                          <div className="w-11 h-11 rounded-xl bg-gradient-to-br from-blue-500/30 to-blue-600/20 flex items-center justify-center border border-blue-500/20">
                            <TrendingUp size={18} className="text-blue-400" />
                          </div>
                          <div className="flex-1 space-y-1.5">
                            <div className="h-2 w-24 bg-white/20 rounded-full" />
                            <div className="h-2 w-14 bg-white/10 rounded-full" />
                          </div>
                        </motion.div>
                      </div>
                    </div>
                    
                    {/* Bottom home indicator */}
                    <div className="absolute bottom-2 left-1/2 -translate-x-1/2 w-28 h-1 bg-white/20 rounded-full" />
                  </div>
                </motion.div>
                
                {/* Decorative floating elements */}
                <motion.div
                  animate={{ y: [-10, 10, -10], rotate: [0, 5, 0] }}
                  transition={{ duration: 5, repeat: Infinity, ease: "easeInOut" }}
                  className="absolute -top-8 -right-8 w-16 h-16 rounded-2xl bg-gradient-to-br from-orange-500/20 to-transparent border border-orange-500/10 backdrop-blur-sm flex items-center justify-center"
                >
                  <Sparkles className="text-orange-400/60" size={24} />
                </motion.div>
                
                <motion.div
                  animate={{ y: [10, -10, 10], rotate: [0, -5, 0] }}
                  transition={{ duration: 6, repeat: Infinity, ease: "easeInOut", delay: 1 }}
                  className="absolute -bottom-4 -left-4 w-14 h-14 rounded-xl bg-gradient-to-br from-pink-500/20 to-transparent border border-pink-500/10 backdrop-blur-sm flex items-center justify-center"
                >
                  <Flame className="text-pink-400/60" size={20} />
                </motion.div>
              </div>

            </motion.div>
          ) : (
            <motion.div
              key="wrapped"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              className="w-full h-full"
            >
              <WrappedDisplay data={wrappedData} username={username} />
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    </main>
  )
}

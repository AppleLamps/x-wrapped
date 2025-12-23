'use client'

import { useState, useEffect } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { Loader2, TrendingUp, Heart, Sparkles, ChevronRight, BarChart3, MessageCircle, Share2 } from 'lucide-react'
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

// Floating icon component for background ambience
const FloatingIcon = ({ icon: Icon, delay, x, y, color }: any) => (
  <motion.div
    initial={{ opacity: 0, y: y + 20 }}
    animate={{ 
      opacity: [0.3, 0.6, 0.3], 
      y: [y, y - 20, y],
      rotate: [0, 10, -10, 0]
    }}
    transition={{ 
      duration: 5, 
      delay, 
      repeat: Infinity,
      ease: "easeInOut" 
    }}
    className={`absolute ${color} pointer-events-none`}
    style={{ left: x, top: y }}
  >
    <Icon size={32} />
  </motion.div>
)

export default function Home() {
  const [username, setUsername] = useState('')
  const [loading, setLoading] = useState(false)
  const [progress, setProgress] = useState({ step: 0, total: 3, message: '', month: '' })
  const [wrappedData, setWrappedData] = useState<WrappedData | null>(null)
  const [error, setError] = useState<string | null>(null)
  const [analysisChunks, setAnalysisChunks] = useState<string[]>([])
  const [mounted, setMounted] = useState(false)

  useEffect(() => {
    setMounted(true)
  }, [])

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
      
      // In local development, call Flask server directly
      // In production (Vercel), use the relative path which routes to the Python function
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
              // Only log parse errors, not thrown errors
              if (!(e instanceof Error && e.message.includes('An error occurred'))) {
                console.error('Error parsing stream data:', e, 'Line:', line)
              } else {
                throw e
              }
            }
          }
        }
      }
      
      // Process any remaining buffer content
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
      
      // If stream ended without complete message, show error
      if (!receivedComplete) {
        throw new Error('Analysis stream ended unexpectedly. Please try again.')
      }
    } catch (err: any) {
      setError(err.message || 'An error occurred')
      setLoading(false)
    }
  }

  // Prevent hydration mismatch
  if (!mounted) return null

  return (
    <main className={`min-h-screen bg-black text-white selection:bg-orange-500/30 ${wrappedData ? 'overflow-hidden h-screen' : 'overflow-x-hidden'}`}>
      
      {/* Background Ambience - Only show on landing */}
      {!wrappedData && (
        <div className="fixed inset-0 pointer-events-none overflow-hidden">
          {/* Grid Pattern */}
          <div className="absolute inset-0 bg-[linear-gradient(to_right,#80808012_1px,transparent_1px),linear-gradient(to_bottom,#80808012_1px,transparent_1px)] bg-[size:24px_24px]"></div>
          <div className="absolute inset-0 bg-gradient-to-t from-black via-transparent to-black"></div>
          
          {/* Orbs */}
          <div className="absolute top-[-10%] left-[-10%] w-[40vw] h-[40vw] bg-orange-500/10 rounded-full blur-[100px]" />
          <div className="absolute bottom-[-10%] right-[-10%] w-[40vw] h-[40vw] bg-pink-500/10 rounded-full blur-[100px]" />
          
          {/* Floating Icons */}
          <FloatingIcon icon={Heart} delay={0} x="15%" y="20%" color="text-red-500/20" />
          <FloatingIcon icon={BarChart3} delay={1.5} x="85%" y="15%" color="text-orange-500/20" />
          <FloatingIcon icon={MessageCircle} delay={0.5} x="80%" y="70%" color="text-blue-500/20" />
          <FloatingIcon icon={TrendingUp} delay={2} x="10%" y="80%" color="text-green-500/20" />
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
              className="w-full max-w-5xl mx-auto grid md:grid-cols-2 gap-12 items-center"
            >
              {/* Left Column: Input Area */}
              <div className="space-y-8 z-20">
                <div className="space-y-2">
                  <motion.div
                    initial={{ opacity: 0, x: -20 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{ delay: 0.1 }}
                    className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-white/5 border border-white/10 text-xs font-medium text-orange-400"
                  >
                    <Sparkles size={12} />
                    <span>Powered by Grok AI</span>
                  </motion.div>
                  <motion.h1 
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: 0.2 }}
                    className="text-5xl md:text-7xl font-bold tracking-tight"
                  >
                    Your Year <br />
                    <span className="gradient-text">Unwrapped.</span>
                  </motion.h1>
                  <motion.p 
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: 0.3 }}
                    className="text-xl text-gray-400 max-w-md"
                  >
                    Discover your 2025 X personality. Your voice, your vibe, your greatest hits—all analyzed by Grok AI.
                  </motion.p>
                </div>

                <motion.div
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: 0.4 }}
                  className="space-y-4"
                >
                  <div className="relative group max-w-md">
                    <div className="absolute -inset-1 bg-gradient-to-r from-orange-500 to-pink-500 rounded-xl opacity-25 group-hover:opacity-50 transition duration-500 blur"></div>
                    <div className="relative flex items-center bg-black/80 backdrop-blur-xl rounded-xl border border-white/10 p-2 pr-2">
                      <span className="pl-4 text-gray-500 font-medium select-none">@</span>
                      <input
                        type="text"
                        value={username}
                        onChange={(e) => setUsername(e.target.value)}
                        onKeyPress={(e) => e.key === 'Enter' && !loading && handleGenerate()}
                        placeholder="username"
                        className="flex-1 bg-transparent border-none text-white placeholder-gray-600 focus:outline-none focus:ring-0 px-2 py-3 text-lg"
                        disabled={loading}
                      />
                      <button
                        onClick={handleGenerate}
                        disabled={loading || !username.trim()}
                        className="bg-white text-black p-3 rounded-lg hover:bg-gray-200 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                      >
                        {loading ? <Loader2 className="animate-spin" size={20} /> : <ChevronRight size={20} />}
                      </button>
                    </div>
                  </div>
                  {error && (
                    <motion.p 
                      initial={{ opacity: 0 }} 
                      animate={{ opacity: 1 }} 
                      className="text-red-400 text-sm pl-2"
                    >
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
                      <div className="mt-4 h-32 overflow-hidden relative">
                         <div className="absolute inset-0 bg-gradient-to-t from-black via-transparent to-transparent z-10" />
                         <div className="flex flex-col-reverse h-full">
                           {analysisChunks.slice(-5).reverse().map((chunk, i) => (
                             <motion.p 
                               key={i}
                               initial={{ opacity: 0, x: -10 }}
                               animate={{ opacity: 1, x: 0 }}
                               className="text-xs text-gray-500 font-mono truncate py-1"
                             >
                               {chunk.slice(0, 60)}...
                             </motion.p>
                           ))}
                         </div>
                      </div>
                    </motion.div>
                  )}
                </AnimatePresence>
              </div>

              {/* Right Column: Visual Preview */}
              <div className="hidden md:flex items-center justify-center relative">
                <motion.div
                  initial={{ opacity: 0, rotateY: 30, x: 50 }}
                  animate={{ opacity: 1, rotateY: 0, x: 0 }}
                  transition={{ delay: 0.5, duration: 1, type: "spring" }}
                  className="relative z-10 w-80 aspect-[9/16] bg-black border border-white/10 rounded-[2.5rem] p-6 shadow-2xl overflow-hidden"
                >
                  {/* Mock Phone/Card UI */}
                  <div className="absolute inset-0 bg-gradient-to-br from-gray-900 to-black" />
                  <div className="absolute top-0 left-0 right-0 h-32 bg-gradient-to-b from-orange-500/20 to-transparent pointer-events-none" />
                  
                  <div className="relative z-10 h-full flex flex-col items-center justify-between py-8">
                    <div className="w-12 h-1 bg-white/20 rounded-full" />
                    
                    <div className="text-center space-y-4">
                      <div className="w-20 h-20 rounded-full bg-gradient-to-tr from-orange-500 to-pink-500 mx-auto blur-xl opacity-50 absolute top-20 left-1/2 -translate-x-1/2" />
                      <h3 className="text-4xl font-black text-white relative z-10">2025</h3>
                      <p className="text-gray-400 text-sm">WRAPPED</p>
                    </div>

                    <div className="w-full space-y-3 px-2">
                       <div className="h-24 bg-white/5 rounded-2xl border border-white/5 p-3 flex items-center gap-3">
                          <div className="w-10 h-10 rounded-full bg-red-500/20 flex items-center justify-center">
                            <Heart size={16} className="text-red-500" />
                          </div>
                          <div className="flex-1">
                            <div className="h-2 w-16 bg-white/20 rounded mb-2" />
                            <div className="h-2 w-10 bg-white/10 rounded" />
                          </div>
                       </div>
                       <div className="h-24 bg-white/5 rounded-2xl border border-white/5 p-3 flex items-center gap-3">
                          <div className="w-10 h-10 rounded-full bg-blue-500/20 flex items-center justify-center">
                            <TrendingUp size={16} className="text-blue-500" />
                          </div>
                          <div className="flex-1">
                            <div className="h-2 w-20 bg-white/20 rounded mb-2" />
                            <div className="h-2 w-12 bg-white/10 rounded" />
                          </div>
                       </div>
                    </div>
                  </div>
                </motion.div>
                
                {/* Decorative Elements behind the card */}
                <motion.div 
                  animate={{ rotate: 360 }}
                  transition={{ duration: 20, repeat: Infinity, ease: "linear" }}
                  className="absolute inset-0 border border-dashed border-white/10 rounded-full w-[140%] h-[140%] -left-[20%] -top-[20%] -z-10"
                />
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

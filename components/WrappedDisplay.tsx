'use client'

import { useState, useEffect, useCallback } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { 
  Sparkles, Share2, RefreshCw, ChevronRight, ChevronLeft,
  Palette, MessageSquare, Lightbulb, Layers, Star, BookOpen, Zap
} from 'lucide-react'
import { PieChart, Pie, Cell, ResponsiveContainer, Tooltip } from 'recharts'

// =============================================================================
// TYPE DEFINITIONS (matching new backend schema)
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

interface WrappedDisplayProps {
  data: WrappedData
  username: string
}

// =============================================================================
// COLOR PALETTE
// =============================================================================

const THEME_COLORS = [
  '#f97316', // orange
  '#ef4444', // red  
  '#ec4899', // pink
  '#8b5cf6', // purple
  '#3b82f6', // blue
  '#10b981', // emerald
  '#f59e0b', // amber
]

const VIBE_COLORS = {
  positive: '#10b981',
  neutral: '#6b7280', 
  negative: '#ef4444',
}

// =============================================================================
// MAIN COMPONENT
// =============================================================================

export default function WrappedDisplay({ data, username }: WrappedDisplayProps) {
  const [currentSlide, setCurrentSlide] = useState(0)
  const [direction, setDirection] = useState(0)

  const slides = [
    'intro',
    'personality',
    'vibe',
    'themes',
    'voice',
    'content_mix',
    'highlights',
    'greatest_hits',
    'summary',
    'outro'
  ]

  const totalSlides = slides.length

  const nextSlide = useCallback(() => {
    if (currentSlide < totalSlides - 1) {
      setDirection(1)
      setCurrentSlide(prev => prev + 1)
    }
  }, [currentSlide, totalSlides])

  const prevSlide = useCallback(() => {
    if (currentSlide > 0) {
      setDirection(-1)
      setCurrentSlide(prev => prev - 1)
    }
  }, [currentSlide])

  // Keyboard navigation
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'ArrowRight' || e.key === 'Space') {
        nextSlide()
      } else if (e.key === 'ArrowLeft') {
        prevSlide()
      }
    }
    window.addEventListener('keydown', handleKeyDown)
    return () => window.removeEventListener('keydown', handleKeyDown)
  }, [nextSlide, prevSlide])

  // ===========================================================================
  // SLIDE COMPONENTS
  // ===========================================================================

  const IntroSlide = () => (
    <div className="flex flex-col items-center justify-center h-full text-center space-y-6">
      <motion.div
        initial={{ scale: 0.5, opacity: 0 }}
        animate={{ scale: 1, opacity: 1 }}
        transition={{ duration: 0.8, type: "spring" }}
      >
        <h1 className="text-7xl md:text-9xl font-black gradient-text mb-4 tracking-tighter">
          2025
        </h1>
        <h2 className="text-4xl md:text-6xl font-bold text-white tracking-wide">
          WRAPPED
        </h2>
      </motion.div>
      <motion.div
        initial={{ y: 50, opacity: 0 }}
        animate={{ y: 0, opacity: 1 }}
        transition={{ delay: 0.5 }}
        className="glass-effect px-8 py-4 rounded-full"
      >
        <p className="text-xl md:text-2xl text-gray-300">@{username}</p>
      </motion.div>
      <motion.p
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ delay: 1, duration: 1 }}
        className="absolute bottom-12 text-gray-500 animate-pulse"
      >
        Tap or use arrow keys to continue
      </motion.p>
    </div>
  )

  const PersonalitySlide = () => {
    const personality = data.personality
    
    return (
      <div className="flex flex-col items-center justify-center h-full p-6 text-center">
        <motion.p
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          className="text-gray-400 uppercase tracking-widest mb-4"
        >
          Your X Personality
        </motion.p>

        <motion.div
          initial={{ scale: 0 }}
          animate={{ scale: 1 }}
          transition={{ delay: 0.2, type: "spring", stiffness: 200 }}
          className="text-8xl md:text-9xl mb-6"
        >
          {personality?.spirit_emoji || '✨'}
        </motion.div>

        <motion.h2
          initial={{ y: 20, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          transition={{ delay: 0.4 }}
          className="text-4xl md:text-6xl font-black gradient-text mb-6"
        >
          {personality?.archetype || 'The Storyteller'}
        </motion.h2>

        <motion.p
          initial={{ y: 20, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          transition={{ delay: 0.6 }}
          className="text-xl text-gray-300 max-w-2xl mb-8"
        >
          {personality?.description}
        </motion.p>

        <motion.div
          initial={{ y: 20, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          transition={{ delay: 0.8 }}
          className="flex flex-wrap justify-center gap-3"
        >
          {personality?.traits?.map((trait, idx) => (
            <span
              key={idx}
              className="px-4 py-2 glass-effect rounded-full text-sm font-medium text-white"
            >
              {trait}
            </span>
          ))}
        </motion.div>
      </div>
    )
  }

  const VibeSlide = () => {
    const vibe = data.vibe
    const vibeData = [
      { name: 'Positive', value: vibe?.positive_percentage || 33, color: VIBE_COLORS.positive },
      { name: 'Neutral', value: vibe?.neutral_percentage || 34, color: VIBE_COLORS.neutral },
      { name: 'Negative', value: vibe?.negative_percentage || 33, color: VIBE_COLORS.negative },
    ]

    return (
      <div className="flex flex-col items-center justify-center h-full p-6">
        <motion.h2 
          initial={{ y: -20, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          className="text-4xl font-bold mb-2 flex items-center gap-3"
        >
          <Sparkles className="text-pink-500 w-10 h-10" />
          The Vibe Check
        </motion.h2>

        <motion.p
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.2 }}
          className="text-2xl md:text-3xl font-bold gradient-text-blue mb-6"
        >
          {vibe?.overall_vibe || 'Balanced'}
        </motion.p>

        <motion.div 
          initial={{ scale: 0.8, opacity: 0 }}
          animate={{ scale: 1, opacity: 1 }}
          transition={{ delay: 0.3 }}
          className="w-full max-w-md aspect-square relative mb-6"
        >
          <ResponsiveContainer width="100%" height="100%">
            <PieChart>
              <Pie
                data={vibeData}
                cx="50%"
                cy="50%"
                innerRadius={70}
                outerRadius={130}
                paddingAngle={5}
                dataKey="value"
              >
                {vibeData.map((entry, index) => (
                  <Cell key={`cell-${index}`} fill={entry.color} stroke="none" />
                ))}
              </Pie>
              <Tooltip 
                contentStyle={{ backgroundColor: '#1f2937', border: 'none', borderRadius: '0.5rem' }}
                itemStyle={{ color: '#fff' }}
                formatter={(value: number) => [`${value}%`, '']}
              />
            </PieChart>
          </ResponsiveContainer>
          <div className="absolute inset-0 flex items-center justify-center pointer-events-none">
            <div className="flex gap-6 text-sm">
              {vibeData.map((item, idx) => (
                <div key={idx} className="flex items-center gap-2">
                  <div className="w-3 h-3 rounded-full" style={{ backgroundColor: item.color }} />
                  <span className="text-gray-400">{item.name}</span>
                </div>
              ))}
            </div>
          </div>
        </motion.div>

        <motion.div
          initial={{ y: 20, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          transition={{ delay: 0.5 }}
          className="glass-effect p-6 rounded-2xl max-w-2xl text-center"
        >
          <p className="text-lg text-gray-200">{vibe?.vibe_description}</p>
        </motion.div>
      </div>
    )
  }

  const ThemesSlide = () => {
    const themes = data.themes?.slice(0, 7) || []
    const maxWeight = Math.max(...themes.map(t => t.weight), 1)

    return (
      <div className="flex flex-col items-center justify-center h-full p-6">
        <motion.h2 
          initial={{ y: -20, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          className="text-4xl font-bold mb-4 flex items-center gap-3"
        >
          <Lightbulb className="text-amber-500 w-10 h-10" />
          What You're About
        </motion.h2>

        <motion.p
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.1 }}
          className="text-gray-400 mb-10 text-center"
        >
          The themes and topics that defined your year
        </motion.p>

        <div className="w-full max-w-3xl space-y-4">
          {themes.map((theme, idx) => (
            <motion.div
              key={idx}
              initial={{ x: -50, opacity: 0 }}
              animate={{ x: 0, opacity: 1 }}
              transition={{ delay: idx * 0.1 }}
              className="flex items-center gap-4"
            >
              <div className="w-28 text-right font-bold text-gray-300 truncate text-sm">
                {theme.theme}
              </div>
              <div className="flex-1 h-10 bg-white/5 rounded-full overflow-hidden relative">
                <motion.div
                  initial={{ width: 0 }}
                  animate={{ width: `${(theme.weight / maxWeight) * 100}%` }}
                  transition={{ delay: 0.5 + (idx * 0.1), duration: 1, type: "spring" }}
                  className="h-full absolute left-0 top-0 rounded-full"
                  style={{ backgroundColor: THEME_COLORS[idx % THEME_COLORS.length] }}
                />
              </div>
            </motion.div>
          ))}
        </div>

        {themes[0]?.sample_context && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 1.2 }}
            className="mt-8 glass-effect p-4 rounded-xl max-w-2xl"
          >
            <p className="text-sm text-gray-400 italic">"{themes[0].sample_context}"</p>
          </motion.div>
        )}
      </div>
    )
  }

  const VoiceSlide = () => {
    const voice = data.voice

    return (
      <div className="flex flex-col items-center justify-center h-full p-6">
        <motion.h2 
          initial={{ y: -20, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          className="text-4xl font-bold mb-8 flex items-center gap-3"
        >
          <MessageSquare className="text-blue-500 w-10 h-10" />
          Your Voice
        </motion.h2>

        <motion.div
          initial={{ scale: 0.9, opacity: 0 }}
          animate={{ scale: 1, opacity: 1 }}
          transition={{ delay: 0.2 }}
          className="glass-effect p-8 rounded-3xl max-w-3xl mb-8"
        >
          <p className="text-2xl md:text-3xl font-medium leading-relaxed text-center gradient-text-blue">
            "{voice?.style_summary}"
          </p>
        </motion.div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 w-full max-w-4xl">
          <motion.div
            initial={{ y: 20, opacity: 0 }}
            animate={{ y: 0, opacity: 1 }}
            transition={{ delay: 0.4 }}
            className="glass-effect p-6 rounded-2xl text-center"
          >
            <p className="text-gray-400 text-sm mb-2">Vocabulary</p>
            <p className="text-lg font-bold text-white">{voice?.vocabulary_level}</p>
          </motion.div>

          <motion.div
            initial={{ y: 20, opacity: 0 }}
            animate={{ y: 0, opacity: 1 }}
            transition={{ delay: 0.5 }}
            className="glass-effect p-6 rounded-2xl text-center"
          >
            <p className="text-gray-400 text-sm mb-2">Tone</p>
            <p className="text-lg font-bold text-white">{voice?.tone}</p>
          </motion.div>

          <motion.div
            initial={{ y: 20, opacity: 0 }}
            animate={{ y: 0, opacity: 1 }}
            transition={{ delay: 0.6 }}
            className="glass-effect p-6 rounded-2xl text-center"
          >
            <p className="text-gray-400 text-sm mb-2">Emoji Style</p>
            <p className="text-lg font-bold text-white">{voice?.emoji_style}</p>
          </motion.div>
        </div>

        {voice?.signature_phrases && voice.signature_phrases.length > 0 && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.8 }}
            className="mt-8"
          >
            <p className="text-gray-400 text-sm mb-3 text-center">Signature phrases</p>
            <div className="flex flex-wrap justify-center gap-2">
              {voice.signature_phrases.map((phrase, idx) => (
                <span
                  key={idx}
                  className="px-4 py-2 bg-gradient-to-r from-orange-500/20 to-pink-500/20 rounded-full text-sm font-mono text-orange-300"
                >
                  "{phrase}"
                </span>
              ))}
            </div>
          </motion.div>
        )}
      </div>
    )
  }

  const ContentMixSlide = () => {
    const mix = data.content_mix
    const categories = mix?.categories?.slice(0, 5) || []

    return (
      <div className="flex flex-col items-center justify-center h-full p-6">
        <motion.h2 
          initial={{ y: -20, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          className="text-4xl font-bold mb-4 flex items-center gap-3"
        >
          <Layers className="text-purple-500 w-10 h-10" />
          Your Content Mix
        </motion.h2>

        <motion.p
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.1 }}
          className="text-2xl font-bold gradient-text mb-8"
        >
          {mix?.primary_mode || 'Original Thinker'}
        </motion.p>

        <div className="grid grid-cols-2 md:grid-cols-3 gap-4 w-full max-w-3xl mb-8">
          {categories.map((cat, idx) => (
            <motion.div
              key={idx}
              initial={{ scale: 0.8, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              transition={{ delay: 0.2 + idx * 0.1 }}
              className="glass-effect p-6 rounded-2xl text-center relative overflow-hidden"
            >
              <div 
                className="absolute bottom-0 left-0 right-0 opacity-30"
                style={{ 
                  height: `${cat.percentage}%`,
                  backgroundColor: THEME_COLORS[idx % THEME_COLORS.length]
                }}
              />
              <p className="text-3xl font-black text-white relative z-10">{cat.percentage}%</p>
              <p className="text-sm text-gray-400 relative z-10 mt-1">{cat.category}</p>
            </motion.div>
          ))}
        </div>

        {mix?.engagement_style && (
          <motion.div
            initial={{ y: 20, opacity: 0 }}
            animate={{ y: 0, opacity: 1 }}
            transition={{ delay: 0.8 }}
            className="glass-effect p-6 rounded-2xl max-w-2xl text-center"
          >
            <p className="text-gray-400 text-sm mb-2">Engagement Style</p>
            <p className="text-lg text-white">{mix.engagement_style}</p>
          </motion.div>
        )}
      </div>
    )
  }

  const HighlightsSlide = () => {
    const highlights = data.highlights?.slice(0, 4) || []

    return (
      <div className="flex flex-col items-center justify-center h-full p-6">
        <motion.h2 
          initial={{ y: -20, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          className="text-4xl font-bold mb-8 flex items-center gap-3"
        >
          <Star className="text-yellow-500 w-10 h-10 fill-yellow-500" />
          Notable Moments
        </motion.h2>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 w-full max-w-5xl">
          {highlights.map((highlight, idx) => (
            <motion.div
              key={idx}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: idx * 0.15 }}
              className="glass-effect p-6 rounded-2xl border-l-4 relative overflow-hidden"
              style={{ borderColor: THEME_COLORS[idx % THEME_COLORS.length] }}
            >
              <div className="flex justify-between items-start mb-3">
                <h3 className="text-xl font-bold text-white">{highlight.title}</h3>
                {highlight.time_period && (
                  <span className="text-xs text-gray-500 bg-white/10 px-2 py-1 rounded">
                    {highlight.time_period}
                  </span>
                )}
              </div>
              <p className="text-gray-300 text-sm mb-3">{highlight.description}</p>
              {highlight.post_snippet && (
                <p className="text-xs text-gray-500 italic border-t border-white/10 pt-3 mt-3">
                  "{highlight.post_snippet}"
                </p>
              )}
            </motion.div>
          ))}
        </div>
      </div>
    )
  }

  const GreatestHitsSlide = () => {
    const hits = data.greatest_hits?.slice(0, 4) || []

    return (
      <div className="flex flex-col items-center justify-center h-full p-6">
        <motion.h2 
          initial={{ y: -20, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          className="text-4xl font-bold mb-8 flex items-center gap-3"
        >
          <Zap className="text-orange-500 w-10 h-10" />
          Greatest Hits
        </motion.h2>

        <div className="space-y-4 w-full max-w-4xl">
          {hits.map((hit, idx) => (
            <motion.div
              key={idx}
              initial={{ x: idx % 2 === 0 ? -50 : 50, opacity: 0 }}
              animate={{ x: 0, opacity: 1 }}
              transition={{ delay: idx * 0.2 }}
              className="glass-effect p-6 rounded-2xl relative overflow-hidden"
            >
              <div 
                className="absolute top-0 left-0 w-2 h-full"
                style={{ backgroundColor: THEME_COLORS[idx % THEME_COLORS.length] }}
              />
              <div className="flex justify-between items-start mb-3 ml-2">
                <span 
                  className="text-xs font-bold uppercase tracking-wider px-3 py-1 rounded-full"
                  style={{ 
                    backgroundColor: `${THEME_COLORS[idx % THEME_COLORS.length]}30`,
                    color: THEME_COLORS[idx % THEME_COLORS.length]
                  }}
                >
                  {hit.category}
                </span>
              </div>
              <p className="text-lg text-white mb-3 leading-relaxed ml-2">"{hit.content}"</p>
              {hit.context && (
                <p className="text-sm text-gray-400 ml-2">{hit.context}</p>
              )}
            </motion.div>
          ))}
        </div>
      </div>
    )
  }

  const SummarySlide = () => (
    <div className="flex flex-col items-center justify-center h-full p-6 max-w-4xl mx-auto text-center">
      <motion.h2 
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        className="text-3xl font-bold mb-8 flex items-center gap-3"
      >
        <BookOpen className="text-emerald-500 w-8 h-8" />
        Your Year Story
      </motion.h2>
      
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.2 }}
        className="glass-effect p-10 rounded-3xl relative"
      >
        <span className="absolute top-4 left-6 text-6xl text-orange-500/20 font-serif">"</span>
        <p className="text-xl md:text-2xl leading-relaxed text-gray-200 whitespace-pre-line relative z-10">
          {data.year_story}
        </p>
        <span className="absolute bottom-[-10px] right-6 text-6xl text-orange-500/20 font-serif rotate-180">"</span>
      </motion.div>
    </div>
  )

  const OutroSlide = () => {
    const handleShare = () => {
      const shareText = `I'm ${data.personality?.archetype || 'a Storyteller'} ${data.personality?.spirit_emoji || '✨'} on X! Check out my 2025 Wrapped`
      
      if (navigator.share) {
        navigator.share({
          title: `${username}'s 2025 X Wrapped`,
          text: shareText,
          url: window.location.href,
        })
      } else {
        navigator.clipboard.writeText(`${shareText}\n${window.location.href}`)
        alert('Copied to clipboard!')
      }
    }

    return (
      <div className="flex flex-col items-center justify-center h-full p-6 text-center space-y-8">
        <motion.div
          initial={{ scale: 0.5, opacity: 0 }}
          animate={{ scale: 1, opacity: 1 }}
          transition={{ type: "spring" }}
          className="relative"
        >
          <div className="absolute inset-0 bg-gradient-to-r from-orange-500 to-pink-500 blur-3xl opacity-20" />
          <div className="text-8xl mb-4 relative z-10">
            {data.personality?.spirit_emoji || '✨'}
          </div>
          <h1 className="text-5xl md:text-7xl font-black text-white mb-2 relative z-10">
            {data.personality?.archetype || 'Storyteller'}
          </h1>
          <p className="text-xl text-gray-400 relative z-10">That's your 2025 on X</p>
        </motion.div>

        <motion.div
          initial={{ y: 50, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          transition={{ delay: 0.5 }}
          className="flex flex-col gap-4 w-full max-w-sm"
        >
          <button
            onClick={handleShare}
            className="w-full py-4 bg-white text-black font-bold text-xl rounded-full hover:scale-105 transition-transform flex items-center justify-center gap-2"
          >
            <Share2 className="w-6 h-6" />
            Share My Personality
          </button>
          <button
            onClick={() => window.location.reload()}
            className="w-full py-4 glass-effect text-white font-bold text-xl rounded-full hover:bg-white/10 transition-colors flex items-center justify-center gap-2"
          >
            <RefreshCw className="w-6 h-6" />
            Start Over
          </button>
        </motion.div>
      </div>
    )
  }

  // ===========================================================================
  // SLIDE RENDERING
  // ===========================================================================

  const renderSlide = () => {
    switch (slides[currentSlide]) {
      case 'intro': return <IntroSlide />
      case 'personality': return <PersonalitySlide />
      case 'vibe': return <VibeSlide />
      case 'themes': return <ThemesSlide />
      case 'voice': return <VoiceSlide />
      case 'content_mix': return <ContentMixSlide />
      case 'highlights': return <HighlightsSlide />
      case 'greatest_hits': return <GreatestHitsSlide />
      case 'summary': return <SummarySlide />
      case 'outro': return <OutroSlide />
      default: return null
    }
  }

  return (
    <div className="story-container">
      {/* Progress Bar */}
      <div className="absolute top-4 left-4 right-4 z-50 flex gap-2">
        {slides.map((_, idx) => (
          <div 
            key={idx} 
            className="h-1 flex-1 bg-white/20 rounded-full overflow-hidden"
          >
            <motion.div
              className="h-full bg-white"
              initial={{ width: idx < currentSlide ? '100%' : '0%' }}
              animate={{ width: idx <= currentSlide ? '100%' : '0%' }}
              transition={{ duration: 0.3 }}
            />
          </div>
        ))}
      </div>

      {/* Navigation Controls */}
      {slides[currentSlide] !== 'outro' && (
        <div className="absolute inset-0 flex z-40 pointer-events-none">
          <div 
            className="w-1/3 h-full pointer-events-auto cursor-pointer hover:bg-white/5 transition-colors"
            onClick={prevSlide}
          />
          <div 
            className="w-2/3 h-full pointer-events-auto cursor-pointer hover:bg-white/5 transition-colors"
            onClick={nextSlide}
          />
        </div>
      )}

      {/* Main Content */}
      <AnimatePresence mode="wait" initial={false} custom={direction}>
        <motion.div
          key={currentSlide}
          custom={direction}
          initial={{ x: direction > 0 ? 1000 : -1000, opacity: 0 }}
          animate={{ x: 0, opacity: 1 }}
          exit={{ x: direction > 0 ? -1000 : 1000, opacity: 0 }}
          transition={{ type: "spring", stiffness: 300, damping: 30 }}
          className="w-full h-full relative z-30"
        >
          {renderSlide()}
        </motion.div>
      </AnimatePresence>

      {/* Background Ambience */}
      <div className="absolute inset-0 pointer-events-none z-10">
        <div className="absolute top-[-20%] left-[-20%] w-[50%] h-[50%] bg-orange-500/10 rounded-full blur-[100px] animate-pulse" />
        <div className="absolute bottom-[-20%] right-[-20%] w-[50%] h-[50%] bg-purple-500/10 rounded-full blur-[100px] animate-pulse" style={{ animationDelay: '1s' }} />
      </div>
    </div>
  )
}

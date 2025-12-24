'use client'

import { useState, useEffect, useCallback } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { 
  Sparkles, Share2, RefreshCw,
  MessageSquare, Lightbulb, Layers, Star, BookOpen, Zap, User
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
    <div className="flex flex-col items-center justify-center h-full text-center space-y-6 px-6">
      <motion.div
        initial={{ scale: 0.5, opacity: 0 }}
        animate={{ scale: 1, opacity: 1 }}
        transition={{ duration: 0.8, type: "spring" }}
        className="relative"
      >
        {/* Glow effect behind text */}
        <div className="absolute inset-0 bg-gradient-to-r from-orange-500 to-pink-500 blur-[80px] opacity-30" />
        <h1 className="text-7xl md:text-9xl font-black gradient-text mb-4 tracking-tighter relative z-10">
          2025
        </h1>
        <h2 className="text-4xl md:text-6xl font-bold text-white tracking-wide relative z-10">
          WRAPPED
        </h2>
      </motion.div>
      
      <motion.div
        initial={{ y: 50, opacity: 0 }}
        animate={{ y: 0, opacity: 1 }}
        transition={{ delay: 0.5 }}
        className="glass-effect px-8 py-4 rounded-full border border-white/10"
      >
        <p className="text-xl md:text-2xl text-gray-300 font-medium">@{username}</p>
      </motion.div>
      
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ delay: 1, duration: 1 }}
        className="absolute bottom-12 flex flex-col items-center gap-2"
      >
        <motion.div
          animate={{ y: [0, 8, 0] }}
          transition={{ duration: 1.5, repeat: Infinity }}
          className="w-6 h-10 border-2 border-white/30 rounded-full flex justify-center pt-2"
        >
          <div className="w-1.5 h-3 bg-white/50 rounded-full" />
        </motion.div>
        <p className="text-gray-500 text-sm">Tap or swipe to continue</p>
      </motion.div>
    </div>
  )

  const PersonalitySlide = () => {
    const personality = data.personality
    
    return (
      <div className="flex flex-col items-center justify-center h-full p-6 text-center overflow-y-auto">
        <motion.p
          initial={{ opacity: 0, y: -10 }}
          animate={{ opacity: 1, y: 0 }}
          className="text-gray-400 uppercase tracking-[0.3em] text-sm mb-6"
        >
          Your X Personality
        </motion.p>

        <motion.div
          initial={{ scale: 0, rotate: -180 }}
          animate={{ scale: 1, rotate: 0 }}
          transition={{ delay: 0.2, type: "spring", stiffness: 200 }}
          className="text-7xl md:text-8xl mb-6 relative"
        >
          <div className="absolute inset-0 blur-2xl opacity-50 scale-150">
            {personality?.spirit_emoji || '✨'}
          </div>
          <span className="relative z-10">{personality?.spirit_emoji || '✨'}</span>
        </motion.div>

        <motion.h2
          initial={{ y: 30, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          transition={{ delay: 0.4 }}
          className="text-4xl md:text-5xl lg:text-6xl font-black gradient-text mb-6 leading-tight"
        >
          {personality?.archetype || 'The Storyteller'}
        </motion.h2>

        <motion.p
          initial={{ y: 20, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          transition={{ delay: 0.6 }}
          className="text-lg md:text-xl text-gray-300 max-w-2xl mb-8 leading-relaxed"
        >
          {personality?.description}
        </motion.p>

        <motion.div
          initial={{ y: 20, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          transition={{ delay: 0.8 }}
          className="flex flex-wrap justify-center gap-3 max-w-xl"
        >
          {personality?.traits?.map((trait, idx) => (
            <motion.span
              key={idx}
              initial={{ scale: 0 }}
              animate={{ scale: 1 }}
              transition={{ delay: 0.9 + idx * 0.1, type: "spring" }}
              className="px-5 py-2.5 glass-effect rounded-full text-sm font-semibold text-white border border-white/10"
            >
              {trait}
            </motion.span>
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
      <div className="flex flex-col items-center justify-center h-full p-6 overflow-y-auto">
        <motion.h2 
          initial={{ y: -20, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          className="text-3xl md:text-4xl font-bold mb-2 flex items-center gap-3"
        >
          <Sparkles className="text-pink-500 w-8 h-8 md:w-10 md:h-10" />
          The Vibe Check
        </motion.h2>

        <motion.p
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.2 }}
          className="text-2xl md:text-3xl font-bold gradient-text-blue mb-4"
        >
          {vibe?.overall_vibe || 'Balanced'}
        </motion.p>

        {/* Pie Chart - Smaller and cleaner */}
        <motion.div 
          initial={{ scale: 0.8, opacity: 0 }}
          animate={{ scale: 1, opacity: 1 }}
          transition={{ delay: 0.3 }}
          className="w-full max-w-xs h-64 md:h-72 relative"
        >
          <ResponsiveContainer width="100%" height="100%">
            <PieChart>
              <Pie
                data={vibeData}
                cx="50%"
                cy="50%"
                innerRadius={50}
                outerRadius={90}
                paddingAngle={4}
                dataKey="value"
                stroke="none"
              >
                {vibeData.map((entry, index) => (
                  <Cell key={`cell-${index}`} fill={entry.color} />
                ))}
              </Pie>
              <Tooltip 
                contentStyle={{ 
                  backgroundColor: '#1f2937', 
                  border: 'none', 
                  borderRadius: '0.75rem',
                  padding: '8px 16px'
                }}
                itemStyle={{ color: '#fff' }}
                formatter={(value: number) => [`${value}%`, '']}
              />
            </PieChart>
          </ResponsiveContainer>
        </motion.div>

        {/* Legend - Below chart, not inside */}
        <motion.div
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.5 }}
          className="flex justify-center gap-6 mb-6"
        >
          {vibeData.map((item, idx) => (
            <div key={idx} className="flex items-center gap-2">
              <div 
                className="w-4 h-4 rounded-full shadow-lg" 
                style={{ backgroundColor: item.color }}
              />
              <span className="text-gray-300 text-sm font-medium">
                {item.name} <span className="text-white font-bold">{item.value}%</span>
              </span>
            </div>
          ))}
        </motion.div>

        {/* Description card */}
        <motion.div
          initial={{ y: 20, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          transition={{ delay: 0.6 }}
          className="glass-effect p-5 md:p-6 rounded-2xl max-w-2xl text-center border border-white/5"
        >
          <p className="text-base md:text-lg text-gray-200 leading-relaxed">{vibe?.vibe_description}</p>
        </motion.div>
      </div>
    )
  }

  const ThemesSlide = () => {
    const themes = data.themes?.slice(0, 6) || []
    const maxWeight = Math.max(...themes.map(t => t.weight), 1)

    return (
      <div className="flex flex-col items-center justify-center h-full p-4 md:p-6 overflow-y-auto">
        <motion.h2 
          initial={{ y: -20, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          className="text-3xl md:text-4xl font-bold mb-2 flex items-center gap-3"
        >
          <Lightbulb className="text-amber-500 w-8 h-8 md:w-10 md:h-10" />
          What You're About
        </motion.h2>

        <motion.p
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.1 }}
          className="text-gray-400 mb-8 text-center text-sm md:text-base"
        >
          The themes and topics that defined your year
        </motion.p>

        <div className="w-full max-w-2xl space-y-3 md:space-y-4">
          {themes.map((theme, idx) => (
            <motion.div
              key={idx}
              initial={{ x: -50, opacity: 0 }}
              animate={{ x: 0, opacity: 1 }}
              transition={{ delay: idx * 0.1 }}
              className="group"
            >
              {/* Theme name on top of bar */}
              <div className="flex justify-between items-center mb-1.5">
                <span 
                  className="font-bold text-white text-sm md:text-base"
                  title={theme.theme}
                >
                  {theme.theme}
                </span>
                <span className="text-xs text-gray-500">
                  {Math.round((theme.weight / maxWeight) * 100)}%
                </span>
              </div>
              {/* Progress bar */}
              <div className="h-8 md:h-10 bg-white/5 rounded-full overflow-hidden relative">
                <motion.div
                  initial={{ width: 0 }}
                  animate={{ width: `${(theme.weight / maxWeight) * 100}%` }}
                  transition={{ delay: 0.4 + (idx * 0.1), duration: 0.8, type: "spring" }}
                  className="h-full absolute left-0 top-0 rounded-full flex items-center justify-end pr-3"
                  style={{ 
                    backgroundColor: THEME_COLORS[idx % THEME_COLORS.length],
                    minWidth: '20%'
                  }}
                />
              </div>
            </motion.div>
          ))}
        </div>

        {/* Sample context quote */}
        {themes[0]?.sample_context && (
          <motion.div
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 1 }}
            className="mt-8 glass-effect p-4 md:p-5 rounded-xl max-w-2xl border border-white/5"
          >
            <p className="text-sm md:text-base text-gray-300 italic leading-relaxed">
              "{themes[0].sample_context}"
            </p>
          </motion.div>
        )}
      </div>
    )
  }

  const VoiceSlide = () => {
    const voice = data.voice

    return (
      <div className="flex flex-col items-center justify-center h-full p-4 md:p-6 overflow-y-auto">
        <motion.h2 
          initial={{ y: -20, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          className="text-3xl md:text-4xl font-bold mb-6 flex items-center gap-3"
        >
          <MessageSquare className="text-blue-500 w-8 h-8 md:w-10 md:h-10" />
          Your Voice
        </motion.h2>

        {/* Main quote card */}
        <motion.div
          initial={{ scale: 0.9, opacity: 0 }}
          animate={{ scale: 1, opacity: 1 }}
          transition={{ delay: 0.2 }}
          className="glass-effect p-6 md:p-8 rounded-3xl max-w-3xl mb-8 relative border border-white/5"
        >
          <span className="absolute top-3 left-5 text-5xl text-blue-500/20 font-serif">"</span>
          <p className="text-xl md:text-2xl font-medium leading-relaxed text-center text-gray-100 px-4">
            {voice?.style_summary}
          </p>
          <span className="absolute bottom-1 right-5 text-5xl text-blue-500/20 font-serif rotate-180">"</span>
        </motion.div>

        {/* Stats grid */}
        <div className="grid grid-cols-3 gap-3 md:gap-4 w-full max-w-2xl mb-6">
          {[
            { label: 'Vocabulary', value: voice?.vocabulary_level, color: 'from-orange-500/20 to-red-500/20' },
            { label: 'Tone', value: voice?.tone, color: 'from-blue-500/20 to-purple-500/20' },
            { label: 'Emoji Style', value: voice?.emoji_style, color: 'from-pink-500/20 to-purple-500/20' },
          ].map((item, idx) => (
            <motion.div
              key={idx}
              initial={{ y: 20, opacity: 0 }}
              animate={{ y: 0, opacity: 1 }}
              transition={{ delay: 0.4 + idx * 0.1 }}
              className={`p-4 md:p-5 rounded-2xl text-center bg-gradient-to-br ${item.color} border border-white/5`}
            >
              <p className="text-gray-400 text-xs md:text-sm mb-1">{item.label}</p>
              <p className="text-sm md:text-base font-bold text-white leading-tight">{item.value}</p>
            </motion.div>
          ))}
        </div>

        {/* Signature phrases */}
        {voice?.signature_phrases && voice.signature_phrases.length > 0 && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.7 }}
            className="text-center"
          >
            <p className="text-gray-500 text-xs uppercase tracking-wider mb-3">Signature phrases</p>
            <div className="flex flex-wrap justify-center gap-2">
              {voice.signature_phrases.slice(0, 4).map((phrase, idx) => (
                <motion.span
                  key={idx}
                  initial={{ scale: 0 }}
                  animate={{ scale: 1 }}
                  transition={{ delay: 0.8 + idx * 0.1, type: "spring" }}
                  className="px-4 py-2 bg-gradient-to-r from-orange-500/20 to-pink-500/20 rounded-full text-xs md:text-sm font-mono text-orange-300 border border-orange-500/20"
                >
                  "{phrase}"
                </motion.span>
              ))}
            </div>
          </motion.div>
        )}
      </div>
    )
  }

  const ContentMixSlide = () => {
    const mix = data.content_mix
    const categories = mix?.categories?.slice(0, 6) || []

    return (
      <div className="flex flex-col items-center justify-center h-full p-4 md:p-6 overflow-y-auto">
        <motion.h2 
          initial={{ y: -20, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          className="text-3xl md:text-4xl font-bold mb-2 flex items-center gap-3"
        >
          <Layers className="text-purple-500 w-8 h-8 md:w-10 md:h-10" />
          Your Content Mix
        </motion.h2>

        <motion.p
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.1 }}
          className="text-xl md:text-2xl font-bold gradient-text mb-8"
        >
          {mix?.primary_mode || 'Original Thinker'}
        </motion.p>

        {/* Content categories grid */}
        <div className="grid grid-cols-2 md:grid-cols-3 gap-3 md:gap-4 w-full max-w-2xl mb-6">
          {categories.map((cat, idx) => (
            <motion.div
              key={idx}
              initial={{ scale: 0.8, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              transition={{ delay: 0.2 + idx * 0.08, type: "spring" }}
              className="glass-effect p-4 md:p-5 rounded-2xl text-center relative overflow-hidden border border-white/5"
            >
              {/* Background fill based on percentage */}
              <div 
                className="absolute bottom-0 left-0 right-0 opacity-20 transition-all"
                style={{ 
                  height: `${Math.max(cat.percentage, 10)}%`,
                  backgroundColor: THEME_COLORS[idx % THEME_COLORS.length]
                }}
              />
              <p 
                className="text-3xl md:text-4xl font-black relative z-10"
                style={{ color: THEME_COLORS[idx % THEME_COLORS.length] }}
              >
                {cat.percentage}%
              </p>
              <p className="text-xs md:text-sm text-gray-300 relative z-10 mt-1 font-medium">
                {cat.category}
              </p>
            </motion.div>
          ))}
        </div>

        {/* Engagement style */}
        {mix?.engagement_style && (
          <motion.div
            initial={{ y: 20, opacity: 0 }}
            animate={{ y: 0, opacity: 1 }}
            transition={{ delay: 0.7 }}
            className="glass-effect p-5 md:p-6 rounded-2xl max-w-xl text-center border border-white/5"
          >
            <p className="text-gray-500 text-xs uppercase tracking-wider mb-2">How You Engage</p>
            <p className="text-base md:text-lg text-white font-medium">{mix.engagement_style}</p>
          </motion.div>
        )}
      </div>
    )
  }

  const HighlightsSlide = () => {
    const highlights = data.highlights?.slice(0, 4) || []

    return (
      <div className="flex flex-col items-center h-full p-4 md:p-6 overflow-y-auto">
        <motion.h2 
          initial={{ y: -20, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          className="text-3xl md:text-4xl font-bold mb-6 flex items-center gap-3 pt-8"
        >
          <Star className="text-yellow-500 w-8 h-8 md:w-10 md:h-10 fill-yellow-500" />
          Notable Moments
        </motion.h2>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 w-full max-w-4xl pb-8">
          {highlights.map((highlight, idx) => (
            <motion.div
              key={idx}
              initial={{ opacity: 0, y: 30 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: idx * 0.12 }}
              className="glass-effect p-5 md:p-6 rounded-2xl border-l-4 relative overflow-hidden"
              style={{ borderColor: THEME_COLORS[idx % THEME_COLORS.length] }}
            >
              {/* Subtle glow */}
              <div 
                className="absolute top-0 left-0 w-32 h-32 opacity-10 blur-2xl"
                style={{ backgroundColor: THEME_COLORS[idx % THEME_COLORS.length] }}
              />
              
              <div className="flex justify-between items-start mb-3 relative z-10">
                <h3 className="text-lg md:text-xl font-bold text-white pr-2">{highlight.title}</h3>
                {highlight.time_period && (
                  <span className="text-xs text-gray-400 bg-white/10 px-2.5 py-1 rounded-full whitespace-nowrap">
                    {highlight.time_period}
                  </span>
                )}
              </div>
              <p className="text-gray-300 text-sm md:text-base mb-3 relative z-10 leading-relaxed">
                {highlight.description}
              </p>
              {highlight.post_snippet && (
                <p className="text-xs md:text-sm text-gray-500 italic border-t border-white/10 pt-3 mt-3 relative z-10">
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
      <div className="flex flex-col items-center h-full p-4 md:p-6 overflow-y-auto">
        <motion.h2 
          initial={{ y: -20, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          className="text-3xl md:text-4xl font-bold mb-6 flex items-center gap-3 pt-8"
        >
          <Zap className="text-orange-500 w-8 h-8 md:w-10 md:h-10" />
          Greatest Hits
        </motion.h2>

        <div className="space-y-4 w-full max-w-3xl pb-8">
          {hits.map((hit, idx) => (
            <motion.div
              key={idx}
              initial={{ x: idx % 2 === 0 ? -40 : 40, opacity: 0 }}
              animate={{ x: 0, opacity: 1 }}
              transition={{ delay: idx * 0.15 }}
              className="glass-effect p-5 md:p-6 rounded-2xl relative overflow-hidden border border-white/5"
            >
              {/* Accent bar */}
              <div 
                className="absolute top-0 left-0 w-1.5 h-full"
                style={{ backgroundColor: THEME_COLORS[idx % THEME_COLORS.length] }}
              />
              
              {/* Category badge */}
              <div className="mb-3 ml-3">
                <span 
                  className="text-xs font-bold uppercase tracking-wider px-3 py-1.5 rounded-full inline-block"
                  style={{ 
                    backgroundColor: `${THEME_COLORS[idx % THEME_COLORS.length]}25`,
                    color: THEME_COLORS[idx % THEME_COLORS.length]
                  }}
                >
                  {hit.category}
                </span>
              </div>
              
              {/* Post content */}
              <p className="text-base md:text-lg text-white mb-3 leading-relaxed ml-3">
                "{hit.content}"
              </p>
              
              {/* Context */}
              {hit.context && (
                <p className="text-sm text-gray-400 ml-3">{hit.context}</p>
              )}
            </motion.div>
          ))}
        </div>
      </div>
    )
  }

  const SummarySlide = () => {
    const story = data.year_story
    const hasValidStory = story && story.length > 30 && !story.toLowerCase().includes('unable to generate')

    return (
      <div className="flex flex-col items-center justify-center h-full p-4 md:p-6 max-w-4xl mx-auto text-center">
        <motion.h2 
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          className="text-3xl md:text-4xl font-bold mb-8 flex items-center gap-3"
        >
          <BookOpen className="text-emerald-500 w-8 h-8 md:w-10 md:h-10" />
          Your Year Story
        </motion.h2>
        
        <motion.div
          initial={{ opacity: 0, y: 20, scale: 0.95 }}
          animate={{ opacity: 1, y: 0, scale: 1 }}
          transition={{ delay: 0.2 }}
          className="glass-effect p-8 md:p-10 rounded-3xl relative border border-white/5 max-w-3xl"
        >
          {/* Decorative quotes */}
          <span className="absolute top-4 left-5 text-5xl md:text-6xl text-emerald-500/20 font-serif">"</span>
          
          {hasValidStory ? (
            <p className="text-lg md:text-xl lg:text-2xl leading-relaxed text-gray-100 whitespace-pre-line relative z-10 px-4">
              {story}
            </p>
          ) : (
            <div className="relative z-10 px-4">
              <p className="text-lg md:text-xl text-gray-300 mb-4">
                Your 2025 on X was a unique journey of expression and connection.
              </p>
              <p className="text-base text-gray-400">
                From {data.themes?.[0]?.theme || 'various topics'} to {data.themes?.[1]?.theme || 'different themes'}, 
                you brought your authentic {data.personality?.archetype || 'voice'} energy to every post.
              </p>
            </div>
          )}
          
          <span className="absolute bottom-2 right-5 text-5xl md:text-6xl text-emerald-500/20 font-serif rotate-180">"</span>
        </motion.div>
      </div>
    )
  }

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
          transition={{ type: "spring", stiffness: 200 }}
          className="relative"
        >
          {/* Glowing background */}
          <div className="absolute inset-0 bg-gradient-to-r from-orange-500 to-pink-500 blur-[100px] opacity-30 scale-150" />
          
          {/* Spirit emoji with glow */}
          <div className="text-7xl md:text-8xl mb-4 relative z-10">
            <div className="absolute inset-0 blur-xl opacity-50 scale-125">
              {data.personality?.spirit_emoji || '✨'}
            </div>
            <span className="relative">{data.personality?.spirit_emoji || '✨'}</span>
          </div>
          
          <h1 className="text-4xl md:text-6xl lg:text-7xl font-black text-white mb-2 relative z-10">
            {data.personality?.archetype || 'Storyteller'}
          </h1>
          <p className="text-lg md:text-xl text-gray-400 relative z-10">That's your 2025 on X</p>
        </motion.div>

        <motion.div
          initial={{ y: 50, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          transition={{ delay: 0.5 }}
          className="flex flex-col gap-4 w-full max-w-sm"
        >
          <button
            onClick={handleShare}
            className="w-full py-4 bg-white text-black font-bold text-lg md:text-xl rounded-full hover:scale-105 transition-all duration-200 flex items-center justify-center gap-2 shadow-lg shadow-white/20"
          >
            <Share2 className="w-5 h-5 md:w-6 md:h-6" />
            Share My Wrapped
          </button>
          <button
            onClick={() => window.location.reload()}
            className="w-full py-4 glass-effect text-white font-bold text-lg md:text-xl rounded-full hover:bg-white/10 transition-colors flex items-center justify-center gap-2 border border-white/10"
          >
            <RefreshCw className="w-5 h-5 md:w-6 md:h-6" />
            Try Another User
          </button>
        </motion.div>

        {/* Credit */}
        <motion.p
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 1 }}
          className="text-gray-600 text-sm absolute bottom-6"
        >
          Powered by Grok AI
        </motion.p>
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
      <div className="absolute top-4 left-4 right-4 z-50 flex gap-1.5">
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
        <div className="absolute top-[30%] right-[-10%] w-[30%] h-[30%] bg-blue-500/5 rounded-full blur-[80px] animate-pulse" style={{ animationDelay: '2s' }} />
      </div>
    </div>
  )
}

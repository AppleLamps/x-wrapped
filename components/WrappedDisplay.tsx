'use client'

import { useState, useEffect, useCallback } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { 
  TrendingUp, Heart, MessageCircle, Repeat2, Calendar, 
  BarChart3, Sparkles, Share2, RefreshCw, ChevronRight, ChevronLeft, X 
} from 'lucide-react'
import { 
  BarChart, Bar, PieChart, Pie, Cell, ResponsiveContainer, 
  XAxis, YAxis, Tooltip 
} from 'recharts'

interface WrappedData {
  overview?: {
    total_posts?: number
    best_month?: string
    best_month_engagement?: number
    average_engagement?: number
    peak_posting_times?: string[]
  }
  sentiment?: {
    positive_percentage?: number
    neutral_percentage?: number
    negative_percentage?: number
    most_emotional_month?: string
    sentiment_trend?: string
  }
  top_topics?: Array<{
    topic: string
    frequency: number
    engagement: number
  }>
  writing_style?: string
  monthly_highlights?: Array<{
    month: string
    key_moments: string[]
    top_post: string
    engagement: number
  }>
  year_summary?: string
  interesting_posts?: Array<{
    content: string
    engagement: number
    reason: string
  }>
  engagement_metrics?: {
    total_likes?: number
    total_retweets?: number
    total_replies?: number
    best_category?: string
    interaction_patterns?: string
  }
}

interface WrappedDisplayProps {
  data: WrappedData
  username: string
}

const COLORS = ['#fb923c', '#ef4444', '#ec4899', '#f97316', '#dc2626']

export default function WrappedDisplay({ data, username }: WrappedDisplayProps) {
  const [currentSlide, setCurrentSlide] = useState(0)
  const [direction, setDirection] = useState(0)

  // Define slides
  const slides = [
    'intro',
    'overview',
    'sentiment',
    'topics',
    'style',
    'highlights',
    'engagement',
    'interesting',
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

  // Slide Components
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

  const OverviewSlide = () => (
    <div className="flex flex-col items-center justify-center h-full p-6">
      <motion.h2 
        initial={{ y: -20, opacity: 0 }}
        animate={{ y: 0, opacity: 1 }}
        className="text-4xl font-bold mb-12 flex items-center gap-3"
      >
        <BarChart3 className="text-orange-500 w-10 h-10" />
        The Numbers
      </motion.h2>
      
      <div className="grid grid-cols-2 gap-6 w-full max-w-4xl">
        {[
          { label: 'Total Posts', value: data.overview?.total_posts, delay: 0.1 },
          { label: 'Best Month', value: data.overview?.best_month, delay: 0.2 },
          { label: 'Avg Engagement', value: data.overview?.average_engagement?.toLocaleString(), delay: 0.3 },
          { label: 'Peak Engagement', value: data.overview?.best_month_engagement?.toLocaleString(), delay: 0.4 }
        ].map((stat, idx) => (
          <motion.div
            key={idx}
            initial={{ scale: 0.8, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            transition={{ delay: stat.delay, type: "spring" }}
            className="glass-effect p-8 rounded-3xl flex flex-col items-center justify-center text-center aspect-square"
          >
            <span className="text-4xl md:text-6xl font-black gradient-text mb-4 break-all">
              {stat.value || '-'}
            </span>
            <span className="text-lg text-gray-400 font-medium">{stat.label}</span>
          </motion.div>
        ))}
      </div>
    </div>
  )

  const SentimentSlide = () => {
    const sentimentData = data.sentiment ? [
      { name: 'Positive', value: data.sentiment.positive_percentage || 0, color: '#10b981' },
      { name: 'Neutral', value: data.sentiment.neutral_percentage || 0, color: '#6b7280' },
      { name: 'Negative', value: data.sentiment.negative_percentage || 0, color: '#ef4444' },
    ] : []

    return (
      <div className="flex flex-col items-center justify-center h-full p-6">
        <motion.h2 
          initial={{ y: -20, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          className="text-4xl font-bold mb-8 flex items-center gap-3"
        >
          <Sparkles className="text-pink-500 w-10 h-10" />
          The Vibe Check
        </motion.h2>

        <motion.div 
          initial={{ scale: 0.8, opacity: 0 }}
          animate={{ scale: 1, opacity: 1 }}
          transition={{ delay: 0.2 }}
          className="w-full max-w-lg aspect-square relative mb-8"
        >
          <ResponsiveContainer width="100%" height="100%">
            <PieChart>
              <Pie
                data={sentimentData}
                cx="50%"
                cy="50%"
                innerRadius={60}
                outerRadius={120}
                paddingAngle={5}
                dataKey="value"
              >
                {sentimentData.map((entry, index) => (
                  <Cell key={`cell-${index}`} fill={entry.color} stroke="none" />
                ))}
              </Pie>
              <Tooltip 
                contentStyle={{ backgroundColor: '#1f2937', border: 'none', borderRadius: '0.5rem' }}
                itemStyle={{ color: '#fff' }}
              />
            </PieChart>
          </ResponsiveContainer>
          <div className="absolute inset-0 flex items-center justify-center pointer-events-none">
            <div className="text-center">
              <span className="text-3xl font-bold text-white">
                {data.sentiment?.most_emotional_month}
              </span>
              <p className="text-sm text-gray-400">Most Emotional</p>
            </div>
          </div>
        </motion.div>

        <motion.div
          initial={{ y: 20, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          transition={{ delay: 0.4 }}
          className="glass-effect p-6 rounded-2xl max-w-2xl text-center"
        >
          <p className="text-xl text-gray-200">{data.sentiment?.sentiment_trend}</p>
        </motion.div>
      </div>
    )
  }

  const TopicsSlide = () => {
    const topicsData = data.top_topics?.slice(0, 7).map((topic, idx) => ({
      name: topic.topic,
      value: topic.frequency,
      color: COLORS[idx % COLORS.length]
    })) || []

    return (
      <div className="flex flex-col items-center justify-center h-full p-6">
        <motion.h2 
          initial={{ y: -20, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          className="text-4xl font-bold mb-12 flex items-center gap-3"
        >
          <TrendingUp className="text-red-500 w-10 h-10" />
          Top Topics
        </motion.h2>

        <div className="w-full max-w-3xl space-y-4">
          {topicsData.map((topic, idx) => (
            <motion.div
              key={idx}
              initial={{ x: -50, opacity: 0 }}
              animate={{ x: 0, opacity: 1 }}
              transition={{ delay: idx * 0.1 }}
              className="flex items-center gap-4"
            >
              <div className="w-32 text-right font-bold text-gray-300 truncate">
                {topic.name}
              </div>
              <div className="flex-1 h-12 bg-white/5 rounded-full overflow-hidden relative">
                <motion.div
                  initial={{ width: 0 }}
                  animate={{ width: `${Math.min(100, (topic.value / (topicsData[0]?.value || 1)) * 100)}%` }}
                  transition={{ delay: 0.5 + (idx * 0.1), duration: 1, type: "spring" }}
                  className="h-full absolute left-0 top-0 rounded-full"
                  style={{ backgroundColor: topic.color }}
                />
                <div className="absolute inset-0 flex items-center px-4">
                  <span className="text-white font-bold drop-shadow-md z-10">{topic.value} posts</span>
                </div>
              </div>
            </motion.div>
          ))}
        </div>
      </div>
    )
  }

  const StyleSlide = () => (
    <div className="flex flex-col items-center justify-center h-full p-6 text-center">
      <motion.h2 
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        className="text-2xl text-gray-400 mb-8 uppercase tracking-widest"
      >
        Your Writing Style
      </motion.h2>
      
      <motion.div
        initial={{ scale: 0.9, opacity: 0 }}
        animate={{ scale: 1, opacity: 1 }}
        transition={{ delay: 0.2 }}
        className="glass-effect p-12 rounded-3xl max-w-4xl relative"
      >
        <span className="absolute top-4 left-6 text-8xl text-orange-500/20 font-serif">"</span>
        <p className="text-3xl md:text-5xl font-medium leading-relaxed gradient-text-blue">
          {data.writing_style}
        </p>
        <span className="absolute bottom-[-20px] right-6 text-8xl text-orange-500/20 font-serif rotate-180">"</span>
      </motion.div>
    </div>
  )

  const HighlightsSlide = () => (
    <div className="flex flex-col items-center justify-center h-full p-6">
      <motion.h2 
        initial={{ y: -20, opacity: 0 }}
        animate={{ y: 0, opacity: 1 }}
        className="text-4xl font-bold mb-8 flex items-center gap-3"
      >
        <Calendar className="text-orange-500 w-10 h-10" />
        Monthly Highlights
      </motion.h2>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 w-full max-w-6xl max-h-[70vh] overflow-y-auto p-4 scrollbar-hide">
        {data.monthly_highlights?.map((highlight, idx) => (
          <motion.div
            key={idx}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: idx * 0.05 }}
            className="glass-effect p-6 rounded-xl border-l-4 border-orange-500"
          >
            <h3 className="text-xl font-bold mb-2 text-white">{highlight.month}</h3>
            <p className="text-gray-400 text-sm mb-3 line-clamp-3">{highlight.key_moments?.[0]}</p>
            <div className="text-xs text-orange-400 font-mono">
              Top Post: {highlight.engagement?.toLocaleString()} engagement
            </div>
          </motion.div>
        ))}
      </div>
    </div>
  )

  const EngagementSlide = () => (
    <div className="flex flex-col items-center justify-center h-full p-6">
      <motion.h2 
        initial={{ scale: 0.5, opacity: 0 }}
        animate={{ scale: 1, opacity: 1 }}
        className="text-4xl font-bold mb-12 flex items-center gap-3"
      >
        <Heart className="text-red-600 w-10 h-10 fill-red-600 animate-pulse" />
        The Love You Got
      </motion.h2>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-8 w-full max-w-5xl">
        {[
          { icon: Heart, color: 'text-red-500', label: 'Likes', value: data.engagement_metrics?.total_likes },
          { icon: Repeat2, color: 'text-blue-500', label: 'Retweets', value: data.engagement_metrics?.total_retweets },
          { icon: MessageCircle, color: 'text-green-500', label: 'Replies', value: data.engagement_metrics?.total_replies },
        ].map((item, idx) => (
          <motion.div
            key={idx}
            initial={{ y: 50, opacity: 0 }}
            animate={{ y: 0, opacity: 1 }}
            transition={{ delay: idx * 0.2 }}
            className="glass-effect p-10 rounded-3xl flex flex-col items-center"
          >
            <item.icon className={`w-16 h-16 mb-6 ${item.color}`} />
            <span className="text-5xl font-bold text-white mb-2">
              {item.value?.toLocaleString()}
            </span>
            <span className="text-xl text-gray-400">{item.label}</span>
          </motion.div>
        ))}
      </div>
    </div>
  )

  const InterestingSlide = () => (
    <div className="flex flex-col items-center justify-center h-full p-6">
      <motion.h2 
        initial={{ y: -20, opacity: 0 }}
        animate={{ y: 0, opacity: 1 }}
        className="text-4xl font-bold mb-8"
      >
        Top Hits
      </motion.h2>

      <div className="space-y-6 w-full max-w-4xl">
        {data.interesting_posts?.slice(0, 3).map((post, idx) => (
          <motion.div
            key={idx}
            initial={{ x: idx % 2 === 0 ? -50 : 50, opacity: 0 }}
            animate={{ x: 0, opacity: 1 }}
            transition={{ delay: idx * 0.2 }}
            className="glass-effect p-6 rounded-2xl relative overflow-hidden"
          >
            <div className="absolute top-0 left-0 w-2 h-full bg-gradient-to-b from-orange-500 to-pink-500" />
            <p className="text-xl text-white mb-4 font-light leading-relaxed">"{post.content}"</p>
            <div className="flex justify-between items-end">
              <span className="text-sm text-gray-400 max-w-[70%]">{post.reason}</span>
              <span className="font-bold text-orange-500 text-lg">
                {post.engagement?.toLocaleString()} <Heart className="inline w-4 h-4 ml-1" />
              </span>
            </div>
          </motion.div>
        ))}
      </div>
    </div>
  )

  const SummarySlide = () => (
    <div className="flex flex-col items-center justify-center h-full p-6 max-w-4xl mx-auto text-center">
      <motion.h2 
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        className="text-3xl font-bold mb-8 gradient-text"
      >
        The Big Picture
      </motion.h2>
      
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.2 }}
        className="glass-effect p-8 rounded-3xl"
      >
        <p className="text-xl md:text-2xl leading-relaxed text-gray-200 whitespace-pre-line">
          {data.year_summary}
        </p>
      </motion.div>
    </div>
  )

  const OutroSlide = () => {
    const handleShare = () => {
      if (navigator.share) {
        navigator.share({
          title: `${username}'s 2025 X Wrapped`,
          text: `Check out my 2025 Year in Review on X!`,
          url: window.location.href,
        })
      } else {
        navigator.clipboard.writeText(window.location.href)
        alert('Link copied!')
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
          <h1 className="text-6xl md:text-8xl font-black text-white mb-4 relative z-10">
            THANKS
          </h1>
          <p className="text-2xl text-gray-400 relative z-10">for a great 2025</p>
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
            Share Wrapped
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

  // Slide rendering logic
  const renderSlide = () => {
    switch (slides[currentSlide]) {
      case 'intro': return <IntroSlide />
      case 'overview': return <OverviewSlide />
      case 'sentiment': return <SentimentSlide />
      case 'topics': return <TopicsSlide />
      case 'style': return <StyleSlide />
      case 'highlights': return <HighlightsSlide />
      case 'engagement': return <EngagementSlide />
      case 'interesting': return <InterestingSlide />
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

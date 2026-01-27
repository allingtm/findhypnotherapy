'use client'

import { useRef, useState, useEffect, useCallback } from 'react'

interface VideoPlayerProps {
  src: string
  poster?: string | null
  autoPlay?: boolean
  loop?: boolean
  muted?: boolean
  className?: string
  onEnded?: () => void
  isActive?: boolean
  showFullControls?: boolean
}

function formatTime(seconds: number): string {
  if (isNaN(seconds)) return '0:00'
  const mins = Math.floor(seconds / 60)
  const secs = Math.floor(seconds % 60)
  return `${mins}:${secs.toString().padStart(2, '0')}`
}

export function VideoPlayer({
  src,
  poster,
  autoPlay = true,
  loop = true,
  muted = true,
  className = '',
  onEnded,
  isActive = true,
  showFullControls = false,
}: VideoPlayerProps) {
  const containerRef = useRef<HTMLDivElement>(null)
  const videoRef = useRef<HTMLVideoElement>(null)
  const hideControlsTimer = useRef<NodeJS.Timeout | null>(null)

  const [isPlaying, setIsPlaying] = useState(false)
  const [isMuted, setIsMuted] = useState(muted)
  const [volume, setVolume] = useState(1)
  const [progress, setProgress] = useState(0)
  const [currentTime, setCurrentTime] = useState(0)
  const [duration, setDuration] = useState(0)
  const [showControls, setShowControls] = useState(false)
  const [isFullscreen, setIsFullscreen] = useState(false)
  const [showVolumeSlider, setShowVolumeSlider] = useState(false)
  const [isDragging, setIsDragging] = useState(false)

  // Handle play/pause based on active state
  useEffect(() => {
    const video = videoRef.current
    if (!video) return

    if (isActive && autoPlay) {
      video.play().catch(() => {
        // Autoplay was prevented, likely due to browser policy
      })
    } else {
      video.pause()
    }
  }, [isActive, autoPlay])

  // Update playing state and time
  useEffect(() => {
    const video = videoRef.current
    if (!video) return

    const handlePlay = () => setIsPlaying(true)
    const handlePause = () => setIsPlaying(false)
    const handleTimeUpdate = () => {
      if (video.duration && !isDragging) {
        setCurrentTime(video.currentTime)
        setProgress((video.currentTime / video.duration) * 100)
      }
    }
    const handleLoadedMetadata = () => {
      setDuration(video.duration)
    }
    const handleVolumeChange = () => {
      setVolume(video.volume)
      setIsMuted(video.muted)
    }

    video.addEventListener('play', handlePlay)
    video.addEventListener('pause', handlePause)
    video.addEventListener('timeupdate', handleTimeUpdate)
    video.addEventListener('loadedmetadata', handleLoadedMetadata)
    video.addEventListener('volumechange', handleVolumeChange)

    return () => {
      video.removeEventListener('play', handlePlay)
      video.removeEventListener('pause', handlePause)
      video.removeEventListener('timeupdate', handleTimeUpdate)
      video.removeEventListener('loadedmetadata', handleLoadedMetadata)
      video.removeEventListener('volumechange', handleVolumeChange)
    }
  }, [isDragging])

  // Handle fullscreen changes
  useEffect(() => {
    const handleFullscreenChange = () => {
      setIsFullscreen(!!document.fullscreenElement)
    }

    document.addEventListener('fullscreenchange', handleFullscreenChange)
    return () => {
      document.removeEventListener('fullscreenchange', handleFullscreenChange)
    }
  }, [])

  // Auto-hide controls
  const resetHideTimer = useCallback(() => {
    if (hideControlsTimer.current) {
      clearTimeout(hideControlsTimer.current)
    }
    setShowControls(true)

    if (isPlaying) {
      hideControlsTimer.current = setTimeout(() => {
        setShowControls(false)
      }, 3000)
    }
  }, [isPlaying])

  // Show controls when paused
  useEffect(() => {
    if (!isPlaying && showFullControls) {
      setShowControls(true)
      if (hideControlsTimer.current) {
        clearTimeout(hideControlsTimer.current)
      }
    }
  }, [isPlaying, showFullControls])

  const togglePlay = useCallback((e?: React.MouseEvent) => {
    e?.stopPropagation()
    const video = videoRef.current
    if (!video) return

    if (video.paused) {
      video.play()
    } else {
      video.pause()
    }
  }, [])

  const toggleMute = useCallback((e: React.MouseEvent) => {
    e.stopPropagation()
    const video = videoRef.current
    if (!video) return

    video.muted = !video.muted
    setIsMuted(video.muted)
  }, [])

  const handleVolumeChange = useCallback((e: React.ChangeEvent<HTMLInputElement>) => {
    e.stopPropagation()
    const video = videoRef.current
    if (!video) return

    const newVolume = parseFloat(e.target.value)
    video.volume = newVolume
    video.muted = newVolume === 0
    setVolume(newVolume)
  }, [])

  const handleSeek = useCallback((e: React.MouseEvent<HTMLDivElement>) => {
    e.stopPropagation()
    const video = videoRef.current
    if (!video) return

    const rect = e.currentTarget.getBoundingClientRect()
    const percent = (e.clientX - rect.left) / rect.width
    const newTime = percent * video.duration
    video.currentTime = newTime
    setCurrentTime(newTime)
    setProgress(percent * 100)
  }, [])

  const toggleFullscreen = useCallback(async (e: React.MouseEvent) => {
    e.stopPropagation()
    const container = containerRef.current
    if (!container) return

    try {
      if (document.fullscreenElement) {
        await document.exitFullscreen()
      } else {
        await container.requestFullscreen()
      }
    } catch (err) {
      console.error('Fullscreen error:', err)
    }
  }, [])

  const handleContainerClick = useCallback(() => {
    if (showFullControls) {
      resetHideTimer()
    } else {
      // Simple mode: tap to play/pause
      setShowControls(true)
      setTimeout(() => setShowControls(false), 2000)
      togglePlay()
    }
  }, [showFullControls, resetHideTimer, togglePlay])

  const handleMouseMove = useCallback(() => {
    if (showFullControls) {
      resetHideTimer()
    }
  }, [showFullControls, resetHideTimer])

  // Simple controls (for feed view)
  if (!showFullControls) {
    return (
      <div
        ref={containerRef}
        className={`relative bg-black ${className}`}
        onClick={handleContainerClick}
      >
        <video
          ref={videoRef}
          src={src}
          poster={poster || undefined}
          loop={loop}
          muted={isMuted}
          playsInline
          onEnded={onEnded}
          className="w-full h-full object-contain"
        />

        {/* Progress bar */}
        <div className="absolute bottom-0 left-0 right-0 h-1 bg-white/20">
          <div
            className="h-full bg-white transition-all duration-100"
            style={{ width: `${progress}%` }}
          />
        </div>

        {/* Play/Pause overlay */}
        {showControls && (
          <div className="absolute inset-0 flex items-center justify-center bg-black/20 transition-opacity">
            {isPlaying ? (
              <svg className="w-16 h-16 text-white/80" fill="currentColor" viewBox="0 0 24 24">
                <path d="M6 4h4v16H6V4zm8 0h4v16h-4V4z" />
              </svg>
            ) : (
              <svg className="w-16 h-16 text-white/80" fill="currentColor" viewBox="0 0 24 24">
                <path d="M8 5v14l11-7z" />
              </svg>
            )}
          </div>
        )}

        {/* Mute button */}
        <button
          onClick={toggleMute}
          className="absolute bottom-4 right-4 p-2 bg-black/50 rounded-full text-white hover:bg-black/70 transition-colors"
        >
          {isMuted ? (
            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5.586 15H4a1 1 0 01-1-1v-4a1 1 0 011-1h1.586l4.707-4.707C10.923 3.663 12 4.109 12 5v14c0 .891-1.077 1.337-1.707.707L5.586 15z" />
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 14l2-2m0 0l2-2m-2 2l-2-2m2 2l2 2" />
            </svg>
          ) : (
            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15.536 8.464a5 5 0 010 7.072m2.828-9.9a9 9 0 010 12.728M5.586 15H4a1 1 0 01-1-1v-4a1 1 0 011-1h1.586l4.707-4.707C10.923 3.663 12 4.109 12 5v14c0 .891-1.077 1.337-1.707.707L5.586 15z" />
            </svg>
          )}
        </button>
      </div>
    )
  }

  // Full controls (for detail page)
  return (
    <div
      ref={containerRef}
      className={`relative bg-black ${className}`}
      onClick={handleContainerClick}
      onMouseMove={handleMouseMove}
      onMouseLeave={() => isPlaying && setShowControls(false)}
    >
      <video
        ref={videoRef}
        src={src}
        poster={poster || undefined}
        loop={loop}
        muted={isMuted}
        playsInline
        onEnded={onEnded}
        className="w-full h-full object-contain cursor-pointer"
        onClick={togglePlay}
      />

      {/* Big play button when paused */}
      {!isPlaying && (
        <div className="absolute inset-0 flex items-center justify-center pointer-events-none">
          <div className="bg-black/40 rounded-full p-5">
            <svg className="w-16 h-16 text-white" fill="currentColor" viewBox="0 0 24 24">
              <path d="M8 5v14l11-7z" />
            </svg>
          </div>
        </div>
      )}

      {/* Control bar */}
      <div
        className={`absolute bottom-0 left-0 right-0 bg-gradient-to-t from-black/80 to-transparent px-4 pb-4 pt-12 transition-opacity duration-300 ${
          showControls ? 'opacity-100' : 'opacity-0 pointer-events-none'
        }`}
        onClick={(e) => e.stopPropagation()}
      >
        {/* Progress bar */}
        <div
          className="w-full h-1.5 bg-white/30 rounded-full cursor-pointer mb-3 group"
          onClick={handleSeek}
        >
          <div
            className="h-full bg-white rounded-full relative"
            style={{ width: `${progress}%` }}
          >
            {/* Scrubber handle */}
            <div className="absolute right-0 top-1/2 -translate-y-1/2 w-3.5 h-3.5 bg-white rounded-full opacity-0 group-hover:opacity-100 transition-opacity" />
          </div>
        </div>

        {/* Controls row */}
        <div className="flex items-center gap-3">
          {/* Play/Pause button */}
          <button
            onClick={togglePlay}
            className="text-white hover:text-white/80 transition-colors"
          >
            {isPlaying ? (
              <svg className="w-7 h-7" fill="currentColor" viewBox="0 0 24 24">
                <path d="M6 4h4v16H6V4zm8 0h4v16h-4V4z" />
              </svg>
            ) : (
              <svg className="w-7 h-7" fill="currentColor" viewBox="0 0 24 24">
                <path d="M8 5v14l11-7z" />
              </svg>
            )}
          </button>

          {/* Volume control */}
          <div
            className="flex items-center gap-2"
            onMouseEnter={() => setShowVolumeSlider(true)}
            onMouseLeave={() => setShowVolumeSlider(false)}
          >
            <button
              onClick={toggleMute}
              className="text-white hover:text-white/80 transition-colors"
            >
              {isMuted || volume === 0 ? (
                <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5.586 15H4a1 1 0 01-1-1v-4a1 1 0 011-1h1.586l4.707-4.707C10.923 3.663 12 4.109 12 5v14c0 .891-1.077 1.337-1.707.707L5.586 15z" />
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 14l2-2m0 0l2-2m-2 2l-2-2m2 2l2 2" />
                </svg>
              ) : volume < 0.5 ? (
                <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15.536 8.464a5 5 0 010 7.072M5.586 15H4a1 1 0 01-1-1v-4a1 1 0 011-1h1.586l4.707-4.707C10.923 3.663 12 4.109 12 5v14c0 .891-1.077 1.337-1.707.707L5.586 15z" />
                </svg>
              ) : (
                <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15.536 8.464a5 5 0 010 7.072m2.828-9.9a9 9 0 010 12.728M5.586 15H4a1 1 0 01-1-1v-4a1 1 0 011-1h1.586l4.707-4.707C10.923 3.663 12 4.109 12 5v14c0 .891-1.077 1.337-1.707.707L5.586 15z" />
                </svg>
              )}
            </button>

            {/* Volume slider */}
            <div
              className={`overflow-hidden transition-all duration-200 ${
                showVolumeSlider ? 'w-20 opacity-100' : 'w-0 opacity-0'
              }`}
            >
              <input
                type="range"
                min={0}
                max={1}
                step={0.05}
                value={isMuted ? 0 : volume}
                onChange={handleVolumeChange}
                className="w-full h-1 bg-white/30 rounded-full appearance-none cursor-pointer [&::-webkit-slider-thumb]:appearance-none [&::-webkit-slider-thumb]:w-3 [&::-webkit-slider-thumb]:h-3 [&::-webkit-slider-thumb]:bg-white [&::-webkit-slider-thumb]:rounded-full"
              />
            </div>
          </div>

          {/* Time display */}
          <span className="text-white text-sm font-mono">
            {formatTime(currentTime)} / {formatTime(duration)}
          </span>

          {/* Spacer */}
          <div className="flex-1" />

          {/* Fullscreen button */}
          <button
            onClick={toggleFullscreen}
            className="text-white hover:text-white/80 transition-colors"
          >
            {isFullscreen ? (
              <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 9V4.5M9 9H4.5M9 9L3.75 3.75M9 15v4.5M9 15H4.5M9 15l-5.25 5.25M15 9h4.5M15 9V4.5M15 9l5.25-5.25M15 15h4.5M15 15v4.5m0-4.5l5.25 5.25" />
              </svg>
            ) : (
              <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3.75 3.75v4.5m0-4.5h4.5m-4.5 0L9 9M3.75 20.25v-4.5m0 4.5h4.5m-4.5 0L9 15M20.25 3.75h-4.5m4.5 0v4.5m0-4.5L15 9m5.25 11.25h-4.5m4.5 0v-4.5m0 4.5L15 15" />
              </svg>
            )}
          </button>
        </div>
      </div>
    </div>
  )
}

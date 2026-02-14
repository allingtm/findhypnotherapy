'use client'

import { useRef, useEffect, useMemo } from 'react'
import { Plyr } from 'plyr-react'
import 'plyr-react/plyr.css'
import type { APITypes, PlyrProps } from 'plyr-react'

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
  const ref = useRef<APITypes>(null)

  // Handle active state changes (play/pause based on visibility)
  useEffect(() => {
    const player = ref.current?.plyr
    if (!player) return

    if (isActive && autoPlay) {
      if (typeof player.play === 'function') {
        player.play()
      }
    } else {
      if (typeof player.pause === 'function') {
        player.pause()
      }
    }
  }, [isActive, autoPlay])

  // Handle onEnded callback
  useEffect(() => {
    const player = ref.current?.plyr
    if (!player || !onEnded) return
    if (typeof player.on !== 'function') return

    const handleEnded = () => onEnded()
    player.on('ended', handleEnded)

    return () => {
      if (typeof player.off === 'function') {
        player.off('ended', handleEnded)
      }
    }
  }, [onEnded])

  const plyrOptions: Plyr.Options = useMemo(() => ({
    controls: showFullControls
      ? ['play-large', 'play', 'progress', 'current-time', 'mute', 'volume', 'fullscreen']
      : ['play', 'progress', 'mute'],
    autoplay: autoPlay && isActive,
    muted,
    loop: { active: loop },
    clickToPlay: true,
    hideControls: true,
    resetOnEnd: false,
    keyboard: { focused: true, global: false },
    tooltips: { controls: false, seek: true },
    fullscreen: {
      enabled: true,
      fallback: true,
      iosNative: true
    },
  }), [showFullControls, autoPlay, isActive, muted, loop])

  const plyrSource: PlyrProps['source'] = useMemo(() => ({
    type: 'video' as const,
    sources: [{ src, type: 'video/mp4' }],
    poster: poster || undefined,
  }), [src, poster])

  return (
    <div className={`plyr-wrapper relative bg-black ${className}`}>
      <Plyr
        ref={ref}
        source={plyrSource}
        options={plyrOptions}
      />
      <style jsx global>{`
        .plyr-wrapper {
          --plyr-color-main: #00b3ff;
          --plyr-video-control-color: #fff;
          --plyr-video-control-background: rgba(0, 0, 0, 0.6);
          --plyr-range-fill-background: #00b3ff;
          --plyr-video-progress-buffered-background: rgba(255, 255, 255, 0.3);
        }
        .plyr-wrapper .plyr {
          width: 100%;
          height: 100%;
        }
        .plyr-wrapper .plyr video {
          width: 100%;
          height: 100%;
          object-fit: contain;
        }
        .plyr-wrapper .plyr--video {
          height: 100%;
        }
        .plyr-wrapper .plyr__controls {
          background: linear-gradient(transparent, rgba(0, 0, 0, 0.75)) !important;
          padding-bottom: 8px !important;
        }
        .plyr-wrapper .plyr__control--overlaid {
          background: rgba(0, 0, 0, 0.7) !important;
          border: 2px solid rgba(255, 255, 255, 0.9);
          color: #fff !important;
        }
        .plyr-wrapper .plyr__control--overlaid:hover,
        .plyr-wrapper .plyr__control--overlaid:focus {
          background: rgba(0, 0, 0, 0.85) !important;
        }
      `}</style>
    </div>
  )
}

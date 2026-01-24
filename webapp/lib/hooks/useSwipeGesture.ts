import { useCallback, useRef } from 'react'

interface SwipeConfig {
  onSwipeUp?: () => void
  onSwipeDown?: () => void
  threshold?: number
  preventScroll?: boolean
}

interface TouchPoint {
  x: number
  y: number
  time: number
}

export function useSwipeGesture({
  onSwipeUp,
  onSwipeDown,
  threshold = 50,
  preventScroll = true,
}: SwipeConfig) {
  const touchStart = useRef<TouchPoint | null>(null)
  const touchEnd = useRef<TouchPoint | null>(null)

  const onTouchStart = useCallback((e: React.TouchEvent) => {
    touchEnd.current = null
    touchStart.current = {
      x: e.targetTouches[0].clientX,
      y: e.targetTouches[0].clientY,
      time: Date.now(),
    }
  }, [])

  const onTouchMove = useCallback(
    (e: React.TouchEvent) => {
      touchEnd.current = {
        x: e.targetTouches[0].clientX,
        y: e.targetTouches[0].clientY,
        time: Date.now(),
      }

      // Prevent scroll if vertical swipe detected
      if (preventScroll && touchStart.current) {
        const deltaY = Math.abs(touchEnd.current.y - touchStart.current.y)
        const deltaX = Math.abs(touchEnd.current.x - touchStart.current.x)

        // If primarily vertical movement, prevent default scroll
        if (deltaY > deltaX && deltaY > 10) {
          e.preventDefault()
        }
      }
    },
    [preventScroll]
  )

  const onTouchEnd = useCallback(() => {
    if (!touchStart.current || !touchEnd.current) return

    const deltaX = touchEnd.current.x - touchStart.current.x
    const deltaY = touchEnd.current.y - touchStart.current.y
    const deltaTime = touchEnd.current.time - touchStart.current.time

    // Calculate velocity for better swipe detection
    const velocityY = Math.abs(deltaY) / deltaTime

    // Check if it's primarily a vertical swipe
    const isVerticalSwipe = Math.abs(deltaY) > Math.abs(deltaX)

    if (isVerticalSwipe && (Math.abs(deltaY) > threshold || velocityY > 0.5)) {
      if (deltaY < 0) {
        // Swiped up
        onSwipeUp?.()
      } else {
        // Swiped down
        onSwipeDown?.()
      }
    }

    // Reset
    touchStart.current = null
    touchEnd.current = null
  }, [threshold, onSwipeUp, onSwipeDown])

  return {
    onTouchStart,
    onTouchMove,
    onTouchEnd,
  }
}

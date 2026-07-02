import { useRef } from 'react'

const SWIPE_THRESHOLD = 50

export default function useSwipe(onSwipeLeft, onSwipeRight) {
  const touchStartX = useRef(null)

  function onTouchStart(e) {
    touchStartX.current = e.touches[0].clientX
  }

  function onTouchEnd(e) {
    if (touchStartX.current === null) return
    const deltaX = e.changedTouches[0].clientX - touchStartX.current
    touchStartX.current = null

    if (deltaX < -SWIPE_THRESHOLD) onSwipeLeft()
    else if (deltaX > SWIPE_THRESHOLD) onSwipeRight()
  }

  return { onTouchStart, onTouchEnd }
}

import { useLayoutEffect, useRef } from 'react'
import styled from 'styled-components'

const MAX_FONT_SIZE = 72
const MIN_FONT_SIZE = 8

const CellBox = styled.div`
  box-sizing: border-box;
  min-width: 0;
  min-height: 0;
  display: flex;
  align-items: center;
  justify-content: center;
  overflow: hidden;
  padding: 14px;
  border: 2px solid #000;
`

const Word = styled.span`
  white-space: nowrap;
  line-height: 1;
  font-weight: 600;
`

export function WordCell({ word, font }: { word: string; font: string }) {
  const containerRef = useRef<HTMLDivElement>(null)
  const textRef = useRef<HTMLSpanElement>(null)

  useLayoutEffect(() => {
    const container = containerRef.current
    const textEl = textRef.current
    if (!container || !textEl || !word) return

    const fit = () => {
      const style = getComputedStyle(container)
      const paddingX =
        parseFloat(style.paddingLeft) + parseFloat(style.paddingRight)
      const paddingY =
        parseFloat(style.paddingTop) + parseFloat(style.paddingBottom)
      const availableWidth = container.clientWidth - paddingX
      const availableHeight = container.clientHeight - paddingY

      let size = Math.min(MAX_FONT_SIZE, Math.min(availableWidth, availableHeight))
      textEl.style.fontSize = `${size}px`

      while (
        size > MIN_FONT_SIZE &&
        (textEl.scrollWidth > availableWidth ||
          textEl.scrollHeight > availableHeight)
      ) {
        size -= 1
        textEl.style.fontSize = `${size}px`
      }
    }

    fit()
    void document.fonts.ready.then(fit)

    const observer = new ResizeObserver(fit)
    observer.observe(container)
    return () => observer.disconnect()
  }, [word, font])

  return (
    <CellBox ref={containerRef}>
      {word && <Word ref={textRef}>{word}</Word>}
    </CellBox>
  )
}

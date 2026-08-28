import { useLayoutEffect, useRef } from 'react'
import styled from 'styled-components'

const MAX_FONT_SIZE = 72
const MIN_FONT_SIZE = 8

const CellBox = styled.div`
  position: relative;
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

const FirstLetterBadge = styled.div`
  position: absolute;
  top: 0px;
  left: 4px;
  display: flex;
  align-items: baseline;
  gap: 2px;
  line-height: 1;
  color: #000;
  pointer-events: none;
`

const UpperLetter = styled.span`
  font-size: 1.6rem;
  font-weight: 700;
`

const LowerLetter = styled.span`
  font-size: 1.25rem;
  font-weight: 500;
`

function firstLetterOf(word: string): string | null {
  return word.match(/\p{L}/u)?.[0] ?? null
}

export function WordCell({
  word,
  font,
  showFirstLetter,
}: {
  word: string
  font: string
  showFirstLetter: boolean
}) {
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

  const firstLetter = firstLetterOf(word)

  return (
    <CellBox ref={containerRef}>
      {showFirstLetter && firstLetter && (
        <FirstLetterBadge>
          <UpperLetter>{firstLetter.toUpperCase()}</UpperLetter>
          <LowerLetter>{firstLetter.toLowerCase()}</LowerLetter>
        </FirstLetterBadge>
      )}
      {word && <Word ref={textRef}>{word}</Word>}
    </CellBox>
  )
}

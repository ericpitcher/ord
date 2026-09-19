import { useLayoutEffect, useRef, type RefObject } from 'react'
import styled from 'styled-components'
import { applyCase, type CaseMode } from './caseMode'

const MAX_FONT_SIZE = 72
const MIN_FONT_SIZE = 8
// Leaves a small margin below the exact fit so glyph descenders survive
// html2canvas's PDF-export text rendering, which measures slightly
// differently than the browser and can otherwise clip them.
const FIT_SAFETY_MARGIN_PX = 2

const CellBox = styled.div`
  position: relative;
  box-sizing: border-box;
  min-width: 0;
  min-height: 0;
  overflow: hidden;
  padding: 14px;
  border: 2px solid #000;
`

const StackedBox = styled(CellBox)`
  display: flex;
  flex-direction: column;
  gap: 4px;
  padding: 8px;
`

const StackedRowBox = styled.div`
  flex: 1 1 0;
  width: 100%;
  min-width: 0;
  min-height: 0;
  box-sizing: border-box;
`

const FitBox = styled.div`
  width: 100%;
  height: 100%;
  min-width: 0;
  min-height: 0;
  box-sizing: border-box;
  display: flex;
  align-items: center;
  justify-content: center;
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

function useFitFontSize(
  containerRef: RefObject<HTMLDivElement | null>,
  textRef: RefObject<HTMLSpanElement | null>,
  text: string,
  font: string,
) {
  useLayoutEffect(() => {
    const container = containerRef.current
    const textEl = textRef.current
    if (!container || !textEl || !text) return

    const fit = () => {
      const style = getComputedStyle(container)
      const paddingX =
        parseFloat(style.paddingLeft) + parseFloat(style.paddingRight)
      const paddingY =
        parseFloat(style.paddingTop) + parseFloat(style.paddingBottom)
      const availableWidth = container.clientWidth - paddingX - FIT_SAFETY_MARGIN_PX
      const availableHeight = container.clientHeight - paddingY - FIT_SAFETY_MARGIN_PX

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
  }, [text, font])
}

// Owns both refs itself so the fit-to-container effect always sees an
// already-attached container on mount, even under StrictMode's dev-only
// double-invoke of effects/refs.
function FittedText({ text, font }: { text: string; font: string }) {
  const containerRef = useRef<HTMLDivElement>(null)
  const textRef = useRef<HTMLSpanElement>(null)
  useFitFontSize(containerRef, textRef, text, font)

  return (
    <FitBox ref={containerRef}>
      {text && <Word ref={textRef}>{text}</Word>}
    </FitBox>
  )
}

function StackedRow({ text, font }: { text: string; font: string }) {
  return (
    <StackedRowBox>
      <FittedText text={text} font={font} />
    </StackedRowBox>
  )
}

export function WordCell({
  word,
  casing,
  font,
  showFirstLetter,
}: {
  word: string
  casing: CaseMode
  font: string
  showFirstLetter: boolean
}) {
  const firstLetter = firstLetterOf(word)
  const firstLetterBadge = showFirstLetter && firstLetter && (
    <FirstLetterBadge>
      <UpperLetter>{firstLetter.toUpperCase()}</UpperLetter>
      <LowerLetter>{firstLetter.toLowerCase()}</LowerLetter>
    </FirstLetterBadge>
  )

  if (casing === 'all-three') {
    return (
      <StackedBox>
        {firstLetterBadge}
        <StackedRow text={applyCase(word, 'lowercase')} font={font} />
        <StackedRow text={applyCase(word, 'uppercase')} font={font} />
        <StackedRow text={applyCase(word, 'capitalize')} font={font} />
      </StackedBox>
    )
  }

  return (
    <CellBox>
      {firstLetterBadge}
      <FittedText text={applyCase(word, casing)} font={font} />
    </CellBox>
  )
}

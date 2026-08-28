import { useRef, useState } from 'react'
import styled from 'styled-components'
import { WordCell } from './WordCell'

const COLUMNS = 3
const ROWS = 7
const WORDS_PER_PAGE = COLUMNS * ROWS

function tokenize(input: string): string[] {
  return input.match(/[\p{L}\p{N}'’-]+|[^\s]/gu) ?? []
}

function isWordToken(token: string): boolean {
  return /^[\p{L}\p{N}'’-]+$/u.test(token)
}

function joinTokens(tokens: string[]): string {
  return tokens.reduce((sentence, token) => {
    if (!sentence) return token
    return isWordToken(token) ? `${sentence} ${token}` : `${sentence}${token}`
  }, '')
}

const FONT_OPTIONS = [
  'Andika',
  'Lexend',
  'Atkinson Hyperlegible',
  'Crimson Pro',
  'Merriweather',
  'Lora',
] as const

const DEFAULT_FONT: (typeof FONT_OPTIONS)[number] = 'Andika'

type CaseMode = 'as-entered' | 'uppercase' | 'lowercase' | 'capitalize'

const CASE_OPTIONS: { value: CaseMode; label: string }[] = [
  { value: 'as-entered', label: 'Som skrivet' },
  { value: 'uppercase', label: 'VERSALER' },
  { value: 'lowercase', label: 'gemener' },
  { value: 'capitalize', label: 'Stor bokstav' },
]

function applyCase(word: string, mode: CaseMode): string {
  switch (mode) {
    case 'uppercase':
      return word.toUpperCase()
    case 'lowercase':
      return word.toLowerCase()
    case 'capitalize':
      return word.charAt(0).toUpperCase() + word.slice(1).toLowerCase()
    default:
      return word
  }
}

const Layout = styled.main<{ $font: string }>`
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 28px;
  min-height: 100svh;
  padding: 32px 16px 64px;
  box-sizing: border-box;
  background: #f4f3ec;
  font-family: "${(props) => props.$font}", sans-serif;

  @media (prefers-color-scheme: dark) {
    background: #16171d;
  }

  @media print {
    background: #fff;
    padding: 0;
    gap: 0;
  }
`

const SettingsFieldset = styled.fieldset`
  width: min(600px, 92vw);
  box-sizing: border-box;
  border: 1px solid #000;
  border-radius: 4px;
  padding: 24px 20px 20px;
  margin: 0;
  display: flex;
  flex-direction: column;
  gap: 20px;

  @media print {
    display: none;
  }
`

const SettingsLegend = styled.legend`
  margin-left: 12px;
  padding: 0 8px;
  font-size: 0.85rem;
  font-weight: 600;
  color: #444;
  background: #f4f3ec;

  @media (prefers-color-scheme: dark) {
    color: #ccc;
    background: #16171d;
  }
`

const SettingsRow = styled.div`
  display: flex;
  flex-wrap: wrap;
  gap: 20px;
`

const FontPicker = styled.div`
  display: flex;
  flex-direction: column;
  gap: 6px;
  flex: 1 1 160px;
`

const FontLabel = styled.label`
  font-size: 0.85rem;
  font-weight: 600;
  color: #444;

  @media (prefers-color-scheme: dark) {
    color: #ccc;
  }
`

const FontSelect = styled.select`
  padding: 10px 12px;
  border-radius: 8px;
  border: 1px solid #ccc;
  font-size: 1rem;
  font-family: inherit;
  box-sizing: border-box;
  background: #fff;
`

const InputField = styled.div`
  display: flex;
  flex-direction: column;
  gap: 6px;
  width: min(600px, 92vw);

  @media print {
    display: none;
  }
`

const InputLabel = styled.label`
  font-size: 0.85rem;
  font-weight: 600;
  color: #444;

  @media (prefers-color-scheme: dark) {
    color: #ccc;
  }
`

const Input = styled.input`
  width: 100%;
  font-size: 1.1rem;
  padding: 12px 16px;
  border-radius: 8px;
  border: 1px solid #ccc;
  box-sizing: border-box;
`

const CheckboxRow = styled.label`
  display: flex;
  align-items: center;
  gap: 8px;
  flex: 1 1 160px;
  font-size: 0.95rem;
  color: #333;

  @media (prefers-color-scheme: dark) {
    color: #ccc;
  }
`

const Checkbox = styled.input`
  width: 16px;
  height: 16px;
`

const PdfButton = styled.button`
  width: min(600px, 92vw);
  padding: 12px 16px;
  border-radius: 8px;
  border: none;
  background: #1a1a1a;
  color: #fff;
  font-size: 1rem;
  font-family: inherit;
  cursor: pointer;

  &:disabled {
    background: #999;
    cursor: not-allowed;
  }

  @media print {
    display: none;
  }
`

const Pages = styled.div`
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 32px;

  @media print {
    gap: 0;
  }
`

const Sheet = styled.div`
  width: min(600px, 92vw);
  aspect-ratio: 210 / 297;
  background: #fff;
  box-shadow: 0 2px 10px rgba(0, 0, 0, 0.15);
  padding: 20px;
  box-sizing: border-box;
  display: flex;
  flex-direction: column;
  gap: 12px;

  @media print {
    width: 210mm;
    height: 297mm;
    box-shadow: none;
    page-break-after: always;
  }
`

const Grid = styled.div`
  flex: 1;
  min-height: 0;
  width: 100%;
  box-sizing: border-box;
  display: grid;
  grid-template-columns: repeat(${COLUMNS}, 1fr);
  grid-template-rows: repeat(${ROWS}, 1fr);
  gap: 20px;
`

const SentenceFooter = styled.p`
  margin: 0;
  flex: none;
  font-size: 0.95rem;
  line-height: 1.4;
  text-align: left;
  color: #333;
  word-wrap: break-word;
`

const PdfCaptureLayer = styled.div`
  position: fixed;
  top: 0;
  left: -10000px;
  pointer-events: none;
`

const PdfSheet = styled(Sheet)`
  width: 600px;
  padding: 30px;
`

function chunk<T>(items: T[], size: number): T[][] {
  const groups: T[][] = []
  for (let i = 0; i < items.length; i += size) {
    groups.push(items.slice(i, i + size))
  }
  return groups
}

function App() {
  const [text, setText] = useState('')
  const [font, setFont] = useState<string>(DEFAULT_FONT)
  const [showSentence, setShowSentence] = useState(true)
  const [casing, setCasing] = useState<CaseMode>('as-entered')
  const [includePunctuation, setIncludePunctuation] = useState(true)
  const [isGeneratingPdf, setIsGeneratingPdf] = useState(false)
  const pdfSheetRefs = useRef<(HTMLDivElement | null)[]>([])

  const allTokens = tokenize(text)
  const cellTokens = allTokens
    .map((token, originalIndex) => ({ token, originalIndex }))
    .filter(({ token }) => includePunctuation || isWordToken(token))
  const cellPages = chunk(cellTokens, WORDS_PER_PAGE)
  if (cellPages.length === 0) cellPages.push([])

  const pageFooterTokens = cellPages.reduce<{ footers: string[][]; cursor: number }>(
    (acc, _page, pageIndex) => {
      const isLastPage = pageIndex === cellPages.length - 1
      const end = isLastPage
        ? allTokens.length - 1
        : cellPages[pageIndex + 1][0].originalIndex - 1
      const footerTokens = allTokens.slice(acc.cursor, end + 1)
      return { footers: [...acc.footers, footerTokens], cursor: end + 1 }
    },
    { footers: [], cursor: 0 },
  ).footers

  function renderPageContent(cellWords: string[], footerTokens: string[]) {
    return (
      <>
        <Grid>
          {cellWords.map((word, cellIndex) => (
            <WordCell key={cellIndex} word={applyCase(word, casing)} font={font} />
          ))}
        </Grid>
        {showSentence && footerTokens.length > 0 && (
          <SentenceFooter>
            {joinTokens(footerTokens.map((word) => applyCase(word, casing)))}
          </SentenceFooter>
        )}
      </>
    )
  }

  async function handleCreatePdf() {
    if (allTokens.length === 0 || isGeneratingPdf) return

    setIsGeneratingPdf(true)
    try {
      const [{ default: jsPDF }, { default: html2canvas }] = await Promise.all([
        import('jspdf'),
        import('html2canvas'),
      ])
      await document.fonts.ready

      const pdf = new jsPDF({ unit: 'mm', format: 'a4', orientation: 'portrait' })
      let addedPage = false

      for (const sheetEl of pdfSheetRefs.current) {
        if (!sheetEl) continue

        const canvas = await html2canvas(sheetEl, {
          scale: 3,
          backgroundColor: '#ffffff',
        })
        const imageData = canvas.toDataURL('image/png')

        if (addedPage) pdf.addPage()
        pdf.addImage(imageData, 'PNG', 0, 0, 210, 297)
        addedPage = true
      }

      const url = URL.createObjectURL(pdf.output('blob'))
      window.open(url, '_blank')
    } finally {
      setIsGeneratingPdf(false)
    }
  }

  return (
    <Layout $font={font}>
      <SettingsFieldset>
        <SettingsLegend>Inställningar</SettingsLegend>
        <SettingsRow>
          <FontPicker>
            <FontLabel htmlFor="font-select">Typsnitt</FontLabel>
            <FontSelect
              id="font-select"
              value={font}
              onChange={(event) => setFont(event.target.value)}
            >
              {FONT_OPTIONS.map((name) => (
                <option key={name} value={name}>
                  {name}
                </option>
              ))}
            </FontSelect>
          </FontPicker>
          <FontPicker>
            <FontLabel htmlFor="case-select">Skiftläge</FontLabel>
            <FontSelect
              id="case-select"
              value={casing}
              onChange={(event) => setCasing(event.target.value as CaseMode)}
            >
              {CASE_OPTIONS.map((option) => (
                <option key={option.value} value={option.value}>
                  {option.label}
                </option>
              ))}
            </FontSelect>
          </FontPicker>
        </SettingsRow>
        <SettingsRow>
          <CheckboxRow>
            <Checkbox
              type="checkbox"
              checked={showSentence}
              onChange={(event) => setShowSentence(event.target.checked)}
            />
            Skriv ut meningen längst ner
          </CheckboxRow>
          <CheckboxRow>
            <Checkbox
              type="checkbox"
              checked={includePunctuation}
              onChange={(event) => setIncludePunctuation(event.target.checked)}
            />
            Inkludera skiljetecken
          </CheckboxRow>
        </SettingsRow>
      </SettingsFieldset>
      <InputField>
        <InputLabel htmlFor="sentence-input">Skriv en mening</InputLabel>
        <Input
          id="sentence-input"
          type="text"
          value={text}
          onChange={(event) => setText(event.target.value)}
          placeholder="Type a sentence…"
          autoFocus
        />
      </InputField>
      <PdfButton
        type="button"
        onClick={handleCreatePdf}
        disabled={allTokens.length === 0 || isGeneratingPdf}
      >
        {isGeneratingPdf ? 'Skapar PDF…' : 'Skapa PDF'}
      </PdfButton>
      <Pages>
        {cellPages.map((page, pageIndex) => (
          <Sheet key={pageIndex}>
            {renderPageContent(
              page.map(({ token }) => token),
              pageFooterTokens[pageIndex],
            )}
          </Sheet>
        ))}
      </Pages>
      <PdfCaptureLayer aria-hidden="true">
        {cellPages.map((page, pageIndex) => (
          <PdfSheet
            key={pageIndex}
            ref={(el) => {
              pdfSheetRefs.current[pageIndex] = el
            }}
          >
            {renderPageContent(
              page.map(({ token }) => token),
              pageFooterTokens[pageIndex],
            )}
          </PdfSheet>
        ))}
      </PdfCaptureLayer>
    </Layout>
  )
}

export default App

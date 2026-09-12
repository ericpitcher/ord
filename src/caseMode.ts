export type CaseMode = 'as-entered' | 'uppercase' | 'lowercase' | 'capitalize' | 'all-three'

export const CASE_OPTIONS: { value: CaseMode; label: string }[] = [
  { value: 'as-entered', label: 'Som skrivet' },
  { value: 'uppercase', label: 'VERSALER' },
  { value: 'lowercase', label: 'gemener' },
  { value: 'capitalize', label: 'Stor bokstav' },
  { value: 'all-three', label: 'Alla 3' },
]

export function applyCase(word: string, mode: CaseMode): string {
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

import styled from 'styled-components'

const Page = styled.main`
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  min-height: 100svh;
  text-align: center;
  padding: 24px;
  color: #1a1a1a;
  background: #ffffff;

  @media (prefers-color-scheme: dark) {
    color: #f3f4f6;
    background: #16171d;
  }
`

const Title = styled.h1`
  font-size: 2.5rem;
  margin: 0 0 12px;
`

const Subtitle = styled.p`
  font-size: 1.1rem;
  color: #6b6375;
  margin: 0;

  @media (prefers-color-scheme: dark) {
    color: #9ca3af;
  }
`

function App() {
  return (
    <Page>
      <Title>ord</Title>
      <Subtitle>Welcome to ord.</Subtitle>
    </Page>
  )
}

export default App

import { Suspense, useEffect } from 'react'
import Home from './pages/Home'
import { useRoute } from './lib/navigation'
import { installPageTransitions } from './lib/pageTransition'
import { workPage } from './lib/pages'

export default function App() {
  const route = useRoute()
  const Page = (route === '/' ? undefined : workPage(route)) ?? Home

  useEffect(() => installPageTransitions(), [])

  return (
    <Suspense fallback={null}>
      <Page key={route} />
    </Suspense>
  )
}

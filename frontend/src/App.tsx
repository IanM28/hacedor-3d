import Header from './components/layout/Header'
import Home from './pages/Home'

export function App() {
  return (
    <div className="min-h-screen bg-[var(--color-bg)] font-body text-[var(--color-text-primary)]">
      <Header />
      <main className="pt-14">
        <Home />
      </main>
    </div>
  )
}

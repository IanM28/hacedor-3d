import { Navigate, Route, Routes } from 'react-router-dom'
import Header from './components/layout/Header'
import Home from './pages/Home'
import Catalog from './pages/Catalog'

export function App() {
  return (
    <div className="min-h-screen bg-[var(--color-bg)] font-body text-[var(--color-text-primary)]">
      <Header />
      <main className="pt-14">
        <Routes>
          <Route path="/" element={<Home />} />
          <Route path="/catalogo" element={<Catalog />} />
          <Route path="*" element={<Navigate to="/" replace />} />
        </Routes>
      </main>
    </div>
  )
}

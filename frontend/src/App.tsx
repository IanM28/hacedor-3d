import { Navigate, Route, Routes } from 'react-router-dom'
import Header from './components/layout/Header'
import CartDrawer from './components/layout/CartDrawer'
import Home from './pages/Home'
import Catalog from './pages/Catalog'
import ProductDetail from './pages/ProductDetail'

export function App() {
  return (
    <div className="min-h-screen bg-[var(--color-bg)] font-body text-[var(--color-text-primary)]">
      <Header />
      <CartDrawer />
      <main className="pt-14">
        <Routes>
          <Route path="/" element={<Home />} />
          <Route path="/catalogo" element={<Catalog />} />
          <Route path="/productos/:id" element={<ProductDetail />} />
          <Route path="*" element={<Navigate to="/" replace />} />
        </Routes>
      </main>
    </div>
  )
}

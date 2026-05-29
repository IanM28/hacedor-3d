import { Navigate, Outlet, Route, Routes } from 'react-router-dom'
import Header from './components/layout/Header'
import CartDrawer from './components/layout/CartDrawer'
import Home from './pages/Home'
import Catalog from './pages/Catalog'
import ProductDetail from './pages/ProductDetail'
import Checkout from './pages/Checkout'
import CheckoutSuccess from './pages/CheckoutSuccess'
import CheckoutFailure from './pages/CheckoutFailure'
import CheckoutPending from './pages/CheckoutPending'
import Login from './pages/Auth/Login'
import Register from './pages/Auth/Register'
import AdminLayout from './pages/Admin/AdminLayout'
import AdminDashboard from './pages/Admin/Dashboard'
import AdminProducts from './pages/Admin/Products'
import AdminFilaments from './pages/Admin/Filaments'
import AdminCalculator from './pages/Admin/Calculator'
import AdminCategories from './pages/Admin/Categories'
import AdminSuppliers from './pages/Admin/Suppliers'
import AdminOrders from './pages/Admin/Orders'

function PublicLayout() {
  return (
    <div className="min-h-screen bg-[var(--color-bg)] font-body text-[var(--color-text-primary)]">
      <Header />
      <CartDrawer />
      <main className="pt-14">
        <Outlet />
      </main>
    </div>
  )
}


export function App() {
  return (
    <Routes>
      <Route element={<PublicLayout />}>
        <Route path="/" element={<Home />} />
        <Route path="/catalogo" element={<Catalog />} />
        <Route path="/productos/:id" element={<ProductDetail />} />
        <Route path="/checkout" element={<Checkout />} />
        <Route path="/checkout/success" element={<CheckoutSuccess />} />
        <Route path="/checkout/failure" element={<CheckoutFailure />} />
        <Route path="/checkout/pending" element={<CheckoutPending />} />
        <Route path="/login" element={<Login />} />
        <Route path="/registro" element={<Register />} />
      </Route>

      <Route path="/admin" element={<AdminLayout />}>
        <Route index element={<AdminDashboard />} />
        <Route path="productos" element={<AdminProducts />} />
        <Route path="categorias" element={<AdminCategories />} />
        <Route path="proveedores" element={<AdminSuppliers />} />
        <Route path="filamentos" element={<AdminFilaments />} />
        <Route path="calculadora" element={<AdminCalculator />} />
        <Route path="pedidos" element={<AdminOrders />} />
      </Route>

      <Route path="*" element={<Navigate to="/" replace />} />
    </Routes>
  )
}

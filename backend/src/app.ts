import 'dotenv/config'
import cors from 'cors'
import express from 'express'

import { authenticate, authOptional, requireAdmin } from './middlewares/auth'
import { errorHandler } from './middlewares/errorHandler'
import authRoutes from './routes/auth.routes'
import productRoutes from './routes/product.routes'
import categoryRoutes from './routes/category.routes'
import cartRoutes from './routes/cart.routes'
import orderRoutes from './routes/order.routes'
import paymentRoutes from './routes/payment.routes'
import dashboardRoutes from './routes/dashboard.routes'
import supplierRoutes from './routes/supplier.routes'
import filamentRoutes from './routes/filament.routes'
import uploadRoutes from './routes/upload.routes'
import shippingRoutes from './routes/shipping.routes'

export const app = express()

const frontendUrl = process.env.FRONTEND_URL

app.use(
  cors({
    origin: frontendUrl,
  }),
)
app.use(
  express.json({
    verify: (req, _res, buf) => {
      ;(req as express.Request).rawBody = buf.toString('utf8')
    },
  }),
)

app.get('/health', (_req, res) => {
  res.json({ success: true, data: { ok: true, service: 'hacedor-3d-api' } })
})



app.use('/api/auth', authRoutes)
app.use('/api/products', productRoutes)
app.use('/api/categories', categoryRoutes)
app.use('/api/cart', authOptional, cartRoutes)
app.use('/api/orders', orderRoutes)
app.use('/api/payments', paymentRoutes)
app.use('/api/suppliers', authenticate, requireAdmin, supplierRoutes)
app.use('/api/dashboard', authenticate, requireAdmin, dashboardRoutes)
app.use('/api/filaments', filamentRoutes)
app.use('/api/uploads', uploadRoutes)
app.use('/api/shipping', shippingRoutes)

app.use(errorHandler)


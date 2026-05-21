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

const supplierRoutes = express.Router()
supplierRoutes.get('/', placeholder('GET /api/suppliers [ADMIN]'))
supplierRoutes.post('/', placeholder('POST /api/suppliers [ADMIN]'))
supplierRoutes.put('/:id', placeholder('PUT /api/suppliers/:id [ADMIN]'))
supplierRoutes.delete('/:id', placeholder('DELETE /api/suppliers/:id [ADMIN]'))


app.use('/api/auth', authRoutes)
app.use('/api/products', productRoutes)
app.use('/api/categories', categoryRoutes)
app.use('/api/cart', authOptional, cartRoutes)
app.use('/api/orders', orderRoutes)
app.use('/api/payments', paymentRoutes)
app.use('/api/suppliers', authenticate, requireAdmin, supplierRoutes)
app.use('/api/dashboard', authenticate, requireAdmin, dashboardRoutes)

app.use(errorHandler)

function placeholder(routeName: string) {
  return (_req: express.Request, _res: express.Response, next: express.NextFunction) => {
    next(Object.assign(new Error(`Not implemented: ${routeName}`), { statusCode: 501 }))
  }
}


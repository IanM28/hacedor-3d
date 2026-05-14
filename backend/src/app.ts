import 'dotenv/config'
import cors from 'cors'
import express from 'express'

import { authenticate, authOptional, requireAdmin } from './middlewares/auth'
import { errorHandler } from './middlewares/errorHandler'
import productRoutes from './routes/product.routes'
import categoryRoutes from './routes/category.routes'
import cartRoutes from './routes/cart.routes'
import orderRoutes from './routes/order.routes'

export const app = express()

const frontendUrl = process.env.FRONTEND_URL

app.use(
  cors({
    origin: frontendUrl,
  }),
)
app.use(express.json())

app.get('/health', (_req, res) => {
  res.json({ success: true, data: { ok: true, service: 'hacedor-3d-api' } })
})

const authRoutes = express.Router()
authRoutes.post('/register', placeholder('POST /api/auth/register'))
authRoutes.post('/login', placeholder('POST /api/auth/login'))

const paymentRoutes = express.Router()
paymentRoutes.post('/create-preference', placeholder('POST /api/payments/create-preference'))
paymentRoutes.post('/webhook', placeholder('POST /api/payments/webhook'))
paymentRoutes.get('/status/:paymentId', placeholder('GET /api/payments/status/:paymentId'))

const supplierRoutes = express.Router()
supplierRoutes.get('/', placeholder('GET /api/suppliers [ADMIN]'))
supplierRoutes.post('/', placeholder('POST /api/suppliers [ADMIN]'))
supplierRoutes.put('/:id', placeholder('PUT /api/suppliers/:id [ADMIN]'))
supplierRoutes.delete('/:id', placeholder('DELETE /api/suppliers/:id [ADMIN]'))

const dashboardRoutes = express.Router()
dashboardRoutes.get('/stats', placeholder('GET /api/dashboard/stats [ADMIN]'))
dashboardRoutes.get('/sales', placeholder('GET /api/dashboard/sales [ADMIN]'))

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


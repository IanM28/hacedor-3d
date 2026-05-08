import 'dotenv/config'
import cors from 'cors'
import express from 'express'

import { authenticate, authOptional, requireAdmin } from './middlewares/auth'
import { errorHandler } from './middlewares/errorHandler'

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

const productRoutes = express.Router()
productRoutes.get('/', placeholder('GET /api/products'))
productRoutes.get('/:id', placeholder('GET /api/products/:id'))
productRoutes.post('/', authenticate, requireAdmin, placeholder('POST /api/products [ADMIN]'))
productRoutes.put('/:id', authenticate, requireAdmin, placeholder('PUT /api/products/:id [ADMIN]'))
productRoutes.delete(
  '/:id',
  authenticate,
  requireAdmin,
  placeholder('DELETE /api/products/:id [ADMIN]'),
)

const categoryRoutes = express.Router()
categoryRoutes.get('/', placeholder('GET /api/categories'))
categoryRoutes.post('/', authenticate, requireAdmin, placeholder('POST /api/categories [ADMIN]'))
categoryRoutes.put('/:id', authenticate, requireAdmin, placeholder('PUT /api/categories/:id [ADMIN]'))
categoryRoutes.delete(
  '/:id',
  authenticate,
  requireAdmin,
  placeholder('DELETE /api/categories/:id [ADMIN]'),
)

const cartRoutes = express.Router()
cartRoutes.get('/', placeholder('GET /api/cart'))
cartRoutes.post('/items', placeholder('POST /api/cart/items'))
cartRoutes.put('/items/:id', placeholder('PUT /api/cart/items/:id'))
cartRoutes.delete('/items/:id', placeholder('DELETE /api/cart/items/:id'))
cartRoutes.delete('/', placeholder('DELETE /api/cart'))

const orderRoutes = express.Router()
orderRoutes.post('/', placeholder('POST /api/orders'))
orderRoutes.get('/', placeholder('GET /api/orders'))
orderRoutes.get('/:id', placeholder('GET /api/orders/:id'))
orderRoutes.put('/:id/status', requireAdmin, placeholder('PUT /api/orders/:id/status [ADMIN]'))

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
app.use('/api/orders', authenticate, orderRoutes)
app.use('/api/payments', paymentRoutes)
app.use('/api/suppliers', authenticate, requireAdmin, supplierRoutes)
app.use('/api/dashboard', authenticate, requireAdmin, dashboardRoutes)

app.use(errorHandler)

function placeholder(routeName: string) {
  return (_req: express.Request, _res: express.Response, next: express.NextFunction) => {
    next(Object.assign(new Error(`Not implemented: ${routeName}`), { statusCode: 501 }))
  }
}


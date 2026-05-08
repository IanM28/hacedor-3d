# CLAUDE.md — Hacedor 3D E-Commerce

Este archivo es el contexto permanente del proyecto.
Claude Code debe leerlo COMPLETO al inicio de cada sesion antes de escribir codigo.

---

## Contexto del Proyecto

**Hacedor 3D** es una marca de diseno industrial contemporaneo que utiliza fabricacion
aditiva para crear objetos funcionales, esteticos y tecnicamente precisos.

No es un servicio de impresion 3D. Es una marca de objetos de diseno tecnologico.

Propuesta de valor: Transformar tecnologia en objetos de diseno con proposito.

Posicionamiento: diseno premium accesible, entre objeto decorativo y pieza tecnologica.
Diferencial: no vende productos, crea piezas.

Usuario objetivo: disenadores, ingenieros, profesionales tecnicos, amantes de objetos
bien disenados, consumidores de marcas premium con afinidad tecnologica.

---

## Desarrollador

- Nombre: Ian Moreno
- Rol: Full Stack Developer
- Skills: React, TypeScript, Node.js, PostgreSQL, diseno de interfaces, REST API

---

## Stack Tecnologico

NO cambiar sin consultar.

### Frontend
- React 18 + Vite
- TypeScript (strict mode)
- Tailwind CSS + shadcn/ui
- Zustand (estado global)
- TanStack Query / React Query
- React Router v6
- React Hook Form + Zod
- Framer Motion
- Lucide React

### Backend
- Node.js + Express.js
- TypeScript
- Prisma ORM
- PostgreSQL
- JWT + bcrypt
- Zod
- MercadoPago SDK oficial (@mercadopago/sdk-js frontend, mercadopago backend)

### Herramientas
- Git + GitHub
- ESLint + Prettier
- dotenv

---

## Estructura de Carpetas

```
hacedor-3d/
├── frontend/
│   ├── src/
│   │   ├── components/
│   │   │   ├── ui/           # Button, Input, Modal, Badge, Toast
│   │   │   ├── layout/       # Header, Footer, CartDrawer
│   │   │   └── features/     # ProductCard, QuickView, CartItem, WhatsAppButton
│   │   ├── pages/
│   │   │   ├── Home/
│   │   │   ├── Catalog/
│   │   │   ├── ProductDetail/
│   │   │   ├── Checkout/
│   │   │   ├── CheckoutSuccess/
│   │   │   ├── CheckoutFailure/
│   │   │   ├── Auth/
│   │   │   └── Admin/
│   │   ├── hooks/
│   │   ├── store/
│   │   ├── services/
│   │   ├── types/
│   │   └── utils/
│   └── public/assets/
├── backend/
│   ├── src/
│   │   ├── controllers/
│   │   ├── routes/
│   │   ├── middlewares/
│   │   ├── services/
│   │   │   └── mercadopago.service.ts
│   │   ├── prisma/
│   │   └── types/
│   └── .env.example
└── README.md
```

---

## Variables de Entorno (.env.example)

```
# Base
PORT=3000
DATABASE_URL=postgresql://user:password@localhost:5432/hacedor3d
JWT_SECRET=your_jwt_secret

# MercadoPago
MP_ACCESS_TOKEN=your_mercadopago_access_token
MP_PUBLIC_KEY=your_mercadopago_public_key
MP_WEBHOOK_SECRET=your_webhook_secret
FRONTEND_URL=http://localhost:5173

# WhatsApp
WHATSAPP_NUMBER=5492944XXXXXXX
```

---

## Modelo de Datos (Prisma Schema)

```prisma
model User {
  id        String   @id @default(uuid())
  email     String   @unique
  name      String
  lastName  String
  password  String
  role      Role     @default(CLIENT)
  isActive  Boolean  @default(true)
  createdAt DateTime @default(now())
  orders    Order[]
}

model Category {
  id          String    @id @default(uuid())
  name        String
  slug        String    @unique
  description String?
  isActive    Boolean   @default(true)
  products    Product[]
}

model Supplier {
  id       String    @id @default(uuid())
  name     String
  email    String
  phone    String?
  address  String?
  cbu      String?
  isActive Boolean   @default(true)
  products Product[]
}

model Product {
  id            String      @id @default(uuid())
  code          String      @unique
  name          String
  description   String
  price         Float
  stock         Int         @default(0)
  images        String[]
  isActive      Boolean     @default(true)
  isFeatured    Boolean     @default(false)
  categoryId    String
  supplierId    String
  supplierCost  Float?
  markupPercent Float?      @default(40)
  createdAt     DateTime    @default(now())
  category      Category    @relation(fields: [categoryId], references: [id])
  supplier      Supplier    @relation(fields: [supplierId], references: [id])
  orderItems    OrderItem[]
  cartItems     CartItem[]
}

model Cart {
  id        String     @id @default(uuid())
  userId    String?    @unique
  sessionId String?    @unique
  items     CartItem[]
  createdAt DateTime   @default(now())
  updatedAt DateTime   @updatedAt
}

model CartItem {
  id        String  @id @default(uuid())
  cartId    String
  productId String
  quantity  Int     @default(1)
  cart      Cart    @relation(fields: [cartId], references: [id])
  product   Product @relation(fields: [productId], references: [id])
}

model Order {
  id              String      @id @default(uuid())
  userId          String?
  guestEmail      String?
  status          OrderStatus @default(PENDING)
  total           Float
  shippingCost    Float       @default(0)
  contactName     String
  address         String
  phone           String
  paymentMethod   PaymentMethod @default(MERCADOPAGO)
  mpPaymentId     String?     // ID del pago devuelto por MercadoPago
  mpPreferenceId  String?     // ID de preferencia de MP
  createdAt       DateTime    @default(now())
  user            User?       @relation(fields: [userId], references: [id])
  items           OrderItem[]
}

model OrderItem {
  id        String  @id @default(uuid())
  orderId   String
  productId String
  quantity  Int
  unitPrice Float
  order     Order   @relation(fields: [orderId], references: [id])
  product   Product @relation(fields: [productId], references: [id])
}

enum Role { CLIENT ADMIN }

enum PaymentMethod {
  MERCADOPAGO
  TRANSFER     // Transferencia bancaria manual
  CASH         // Pago en efectivo / presencial
}

enum OrderStatus {
  PENDING
  CONFIRMED
  PREPARING
  SHIPPED
  DELIVERED
  CANCELLED
}
```

---

## Endpoints API REST

### Auth
- POST /api/auth/register
- POST /api/auth/login

### Productos (publicos)
- GET /api/products          ?category= &search= &featured= &code=
- GET /api/products/:id

### Productos (admin)
- POST   /api/products
- PUT    /api/products/:id
- DELETE /api/products/:id

### Categorias
- GET    /api/categories
- POST   /api/categories        admin
- PUT    /api/categories/:id    admin
- DELETE /api/categories/:id    admin

### Carrito
- GET    /api/cart
- POST   /api/cart/items
- PUT    /api/cart/items/:id
- DELETE /api/cart/items/:id
- DELETE /api/cart

### Pedidos
- POST /api/orders
- GET  /api/orders
- GET  /api/orders/:id
- PUT  /api/orders/:id/status   admin

### MercadoPago
- POST /api/payments/create-preference   Crea preferencia MP y devuelve init_point
- POST /api/payments/webhook             Recibe notificaciones de MP (IPN)
- GET  /api/payments/status/:paymentId   Consulta estado de un pago

### Proveedores (admin)
- GET    /api/suppliers
- POST   /api/suppliers
- PUT    /api/suppliers/:id
- DELETE /api/suppliers/:id

### Dashboard (admin)
- GET /api/dashboard/stats
- GET /api/dashboard/sales

---

## Integracion MercadoPago

### Flujo completo

1. Usuario completa formulario de checkout
2. Frontend llama a POST /api/payments/create-preference
3. Backend crea preferencia con SDK de MP y devuelve { preferenceId, init_point }
4. Frontend redirige al init_point (Checkout Pro de MP)
5. MP procesa el pago y redirige a:
   - /checkout/success?payment_id=...&status=approved
   - /checkout/failure?payment_id=...&status=rejected
   - /checkout/pending?payment_id=...&status=pending
6. MP ademas envia webhook a POST /api/payments/webhook
7. Backend verifica el webhook, actualiza el estado del Order en BD

### Implementacion backend (mercadopago.service.ts)

```typescript
import MercadoPago, { Preference } from 'mercadopago'

const client = new MercadoPago({ accessToken: process.env.MP_ACCESS_TOKEN! })

export async function createPreference(order: OrderWithItems) {
  const preference = new Preference(client)

  const response = await preference.create({
    body: {
      items: order.items.map(item => ({
        id: item.productId,
        title: item.product.name,
        description: item.product.code,
        quantity: item.quantity,
        unit_price: item.unitPrice,
        currency_id: 'ARS',
      })),
      payer: {
        name: order.contactName,
        email: order.guestEmail ?? order.user?.email ?? '',
      },
      back_urls: {
        success: `${process.env.FRONTEND_URL}/checkout/success`,
        failure: `${process.env.FRONTEND_URL}/checkout/failure`,
        pending: `${process.env.FRONTEND_URL}/checkout/pending`,
      },
      auto_return: 'approved',
      notification_url: `${process.env.BACKEND_URL}/api/payments/webhook`,
      external_reference: order.id,
    },
  })

  return response
}
```

### Variables de entorno necesarias para MP
- MP_ACCESS_TOKEN  (produccion o sandbox de test)
- MP_PUBLIC_KEY    (para el SDK de frontend si se usa Brick)
- FRONTEND_URL     (para back_urls)
- BACKEND_URL      (para notification_url del webhook)

### Notas importantes
- Usar credenciales de TEST durante desarrollo (prefijo TEST-)
- El webhook debe ser una URL publica — usar ngrok en desarrollo local
- Verificar la firma del webhook con MP_WEBHOOK_SECRET antes de procesar
- No confiar solo en back_urls para confirmar el pago — siempre verificar via webhook

---

## Integracion WhatsApp

### Implementacion

Sin API ni costo. Se usa el esquema wa.me con mensaje pre-construido.

Formato del link:
  https://wa.me/[NUMERO]?text=[MENSAJE_URL_ENCODED]

El numero debe incluir codigo de pais sin + ni espacios:
  Argentina codigo de area Bariloche: 5492944XXXXXXX

### Casos de uso y mensajes

Consulta desde pagina de producto:
  https://wa.me/5492944XXXXXXX?text=Hola!%20Quiero%20consultar%20sobre%20*AERO-01*%20-%20Soporte%20de%20escritorio.%20%C2%BFTiene%20stock%3F

Consulta desde checkout (pago por transferencia):
  https://wa.me/5492944XXXXXXX?text=Hola!%20Quiero%20hacer%20un%20pedido%20por%20transferencia.%20Mi%20pedido%20es%3A%20...

### Componente WhatsAppButton

```typescript
interface WhatsAppButtonProps {
  productCode?: string
  productName?: string
  message?: string   // mensaje custom si no se pasan producto
}

function buildWhatsAppUrl(props: WhatsAppButtonProps): string {
  const number = import.meta.env.VITE_WHATSAPP_NUMBER
  let text = ''

  if (props.productCode && props.productName) {
    text = `Hola! Quiero consultar sobre *${props.productCode}* - ${props.productName}. ¿Tiene stock disponible?`
  } else if (props.message) {
    text = props.message
  } else {
    text = 'Hola! Quiero hacer una consulta sobre Hacedor 3D.'
  }

  return `https://wa.me/${number}?text=${encodeURIComponent(text)}`
}
```

### Donde aparece el boton WhatsApp

- Pagina de detalle de producto: boton secundario debajo del AddToCart
- Pagina de checkout: opcion "Pagar por transferencia / Consultar"
- Footer: icono flotante para contacto general
- Pagina de producto sin stock: reemplaza al boton de compra

### Variable de entorno frontend
  VITE_WHATSAPP_NUMBER=5492944XXXXXXX

---

## Sistema de Diseno

### Filosofia visual

Influencias: Apple (minimalismo, foco en producto) + Nothing Phone (alto contraste,
tecnologia visible) + Teenage Engineering (diseno industrial expresivo).

NO es: rugoso, improvisado, hobby, plastico barato.
SI es: preciso, limpio, tecnico, premium.

### Paleta de colores (CSS Variables)

Extraida del logo: verde bosque #4A7C59, crema #F2EDE4, blanco.

```css
:root {
  --color-bg:           #0D0D0D;
  --color-surface:      #161616;
  --color-surface-2:    #1F1F1F;

  --color-accent:       #4A7C59;
  --color-accent-hover: #5C9B6E;
  --color-accent-dim:   #2E4D37;

  --color-text-primary:   #F2EDE4;
  --color-text-secondary: #8A8A8A;
  --color-text-muted:     #4A4A4A;

  --color-border:       #2A2A2A;
  --color-border-light: #3A3A3A;

  --color-red:          #C0392B;
  --color-whatsapp:     #25D366;
  --color-white:        #FAFAFA;
}
```

### Tipografia

  Headings grandes  :  Bebas Neue (Google Fonts)
  Codigos producto  :  DM Mono (Google Fonts)
  UI / Body         :  DM Sans (Google Fonts)

### Nomenclatura de productos

Formato: [COLECCION]-[NUMERO]

  AERO-XX   geometrica / aeroespacial
  STN-XX    organica / estructural
  MOD-XX    modular / funcional

### Principios de UI

- Fondo negro dominante
- Verde del logo solo en: CTA primario, badges, hover, logo
- Crema como texto principal sobre fondos oscuros
- Alto contraste siempre
- Espaciado generoso
- border-radius maximo 6px
- DM Mono para codigos y datos tecnicos
- Verde WhatsApp (#25D366) SOLO en el boton de WhatsApp

### Comportamiento de componentes clave

ProductCard:
- Codigo en DM Mono, color --color-accent
- Hover: borde verde + swap de imagen
- Badge "ULTIMAS X UNIDADES" si stock < 5
- Badge "DESTACADO" si isFeatured

AddToCart:
- Fondo --color-accent, texto negro
- Animacion Framer Motion al agregar

CartDrawer:
- Panel lateral deslizable, no pagina separada

QuickView:
- Modal overlay rgba(0,0,0,0.85)

WhatsAppButton:
- Fondo #25D366, icono blanco
- Siempre secundario visualmente respecto al CTA principal verde

### Tono de mensajes UI

  CORRECTO:    "AERO-01 agregado al pedido."
  INCORRECTO:  "Increible eleccion! Tu producto fue agregado."

  CORRECTO:    "Sin stock disponible."
  INCORRECTO:  "Ups! Nos quedamos sin este producto."

  CORRECTO:    "Pedido confirmado. ID: #00123"
  INCORRECTO:  "Tu pedido fue enviado con exito!"

---

## Fases de Desarrollo

### FASE 1 — Setup y Base
1. Inicializar monorepo frontend/ y backend/
2. TypeScript strict en ambos proyectos
3. Prisma + PostgreSQL + migraciones iniciales
4. Express con middlewares: cors, json, errorHandler global
5. Vite + React + Tailwind + shadcn/ui
6. CSS variables del design system en index.css
7. Fuentes (Bebas Neue, DM Mono, DM Sans) en index.html
8. Componentes base: Button, Input, Badge, Modal, Toast

### FASE 2 — Catalogo (vista cliente)
1. GET /api/products con filtros
2. Home: hero + grid de productos destacados
3. Catalogo: grid, filtros por categoria, buscador
4. ProductCard con codigo tecnico + hover effects
5. Detalle de producto con galeria de imagenes
6. QuickView modal

### FASE 3 — Carrito, Checkout, Pagos y WhatsApp
1. Zustand cartStore (persistido en localStorage)
2. CartDrawer lateral con animacion
3. Sincronizacion carrito con backend
4. Pagina Checkout con formulario de datos (React Hook Form + Zod)
5. Seleccion de metodo de pago: MercadoPago o Transferencia
6. Integracion MercadoPago Checkout Pro:
   - POST /api/payments/create-preference en backend
   - Redireccion al init_point de MP
   - Paginas /checkout/success, /checkout/failure, /checkout/pending
   - Webhook POST /api/payments/webhook para confirmar pagos
7. Opcion transferencia: redirige a WhatsApp con mensaje del pedido
8. WhatsAppButton en pagina de detalle de producto
9. Boton flotante WhatsApp en footer

### FASE 4 — Auth
1. Endpoints registro y login con JWT
2. Middleware auth en backend
3. Paginas Login y Registro
4. Guards de rutas protegidas

### FASE 5 — Panel Admin
1. Layout dashboard con sidebar
2. CRUD de Productos (con upload de imagenes)
3. CRUD de Categorias y Proveedores
4. Gestion de Pedidos con cambio de estado
5. Dashboard con stats y grafico de ventas

---

## Reglas del Proyecto

1. TypeScript estricto — no usar any
2. Un componente por archivo — max 150 lineas
3. Sin logica en vistas — custom hooks o services
4. Sin comentarios obvios — codigo autodocumentado
5. Manejo de errores siempre — try/catch + estados error en UI
6. Mobile-first — 375px primero, luego escalar
7. Commits: feat: fix: refactor: style:
8. CSS variables siempre — nunca colores hardcodeados
9. Variables de entorno siempre desde .env — nunca hardcodear tokens

---

## Prompt de Arranque por Sesion

Copiar y pegar al inicio de cada sesion en Claude Code:

  Lee el archivo CLAUDE.md en la raiz del proyecto.
  Estamos en la FASE [X]. La tarea de hoy es: [descripcion especifica].
  Antes de escribir codigo, confirmame que archivos vas a crear o modificar.

# Hacedor 3D 🚀 — E-Commerce + ERP de Fabricación Aditiva

¡Bienvenido a **Hacedor 3D**! Una plataforma Full-Stack pensada para transformar la gestión de una marca de diseño industrial y manufactura en impresión 3D. 

A diferencia de un comercio electrónico genérico, este sistema resuelve un problema crítico del negocio de fabricación: **conocer la rentabilidad exacta de cada pieza producida** y **controlar el inventario físico de materia prima (bobinas de filamento)** de forma totalmente independiente al stock comercial publicado en la web.

🔗 **Links del Proyecto:**
- 🌍 **Sitio Web en Vivo (Frontend):** [Vercel.vercel.app](https://hacedor-3d.vercel.app)
- ⚙️ **Servidor de API (Backend):** [Render.onrender.com](https://hacedor-3d.onrender.com)

---

## 🛠️ Stack Tecnológico

### Frontend
![React](https://img.shields.io/badge/React-20232A?style=for-the-badge&logo=react&logoColor=61DAFB)
![TypeScript](https://img.shields.io/badge/TypeScript-007ACC?style=for-the-badge&logo=typescript&logoColor=white)
![Vite](https://img.shields.io/badge/Vite-B738CF?style=for-the-badge&logo=vite&logoColor=white)
![TailwindCSS](https://img.shields.io/badge/Tailwind_CSS-38B2AC?style=for-the-badge&logo=tailwind-css&logoColor=white)
- **Estado Global:** Zustand (con persistencia integrada en `localStorage`).
- **Data Fetching & Cache:** TanStack Query (React Query v5) para sincronización optimizada.
- **Formularios y Validación:** React Hook Form coordinado con schemas de **Zod**.
- **UI & Gráficos:** Componentes basados en la filosofía *shadcn/ui*, animaciones fluidas con Framer Motion y analíticas comerciales mediante Recharts.

### Backend & Base de Datos
![NodeJS](https://img.shields.io/badge/Node.js-43853D?style=for-the-badge&logo=node.js&logoColor=white)
![Express](https://img.shields.io/badge/Express.js-000000?style=for-the-badge&logo=express&logoColor=white)
![Prisma](https://img.shields.io/badge/Prisma-2D3748?style=for-the-badge&logo=prisma&logoColor=white)
![PostgreSQL](https://img.shields.io/badge/PostgreSQL-316192?style=for-the-badge&logo=postgresql&logoColor=white)
- **Estrategia ORM:** Prisma ORM v6 con tipado estricto de punta a punta.
- **Seguridad y Auth:** Autenticación robusta basada en **JWT** (JSON Web Tokens) y hashes de contraseñas mediante **bcrypt**.
- **Validación de Capa:** Middleware de validación con schemas estricto de Zod en cada endpoint antes de impactar los controladores.

### Infraestructura & APIs de Terceros
- ☁️ **Neon:** Servidor de PostgreSQL Serverless en la nube para entornos de producción de alta disponibilidad.
- 🖼️ **Cloudinary:** Gestión automatizada de almacenamiento multimedia y CDN de imágenes mediante `multer-storage-cloudinary`.
- 💳 **Mercado Pago API (SDK v2):** Integración completa de Checkout Pro con procesamiento asíncrono y Webhooks de seguridad IPN.
- 📦 **Envíopack API:** Integración logística para la cotización automática de envíos y generación de etiquetas de despacho.
- 🚀 **Despliegue:** Frontend hosteado en **Vercel** y Backend automatizado en **Render**.

---

## 💡 Módulos y Funcionalidades Críticas

### 1. Motor de Costeo Científico (Multi-Material)
El backend cuenta con un servicio especializado de costeo (`costing.service`) que traduce parámetros físicos en márgenes comerciales exactos. Calcula:
- Consumo exacto de material (fraccionando costos de múltiples bobinas simultáneas).
- Costo energético real basado en consumo de máquina (Watts) × valor de kWh.
- Amortización y desgaste mecánico por hora de uso de la impresora 3D.
- Margen de error parametrizado (30%) y cálculo de **Diezmo comercial** (10% sobre la ganancia neta).
- *Disponible tanto en el formulario de creación de productos como en un simulador ágil e independiente dentro del panel.*

### 2. Control de Inventario por Balanza (Desacople de Stock)
Una de las reglas de negocio más complejas implementadas es la separación del **Stock Comercial** (unidades a la venta en la web) del **Inventario de Materia Prima** (plástico real disponible).
- **Métrica Dinámica:** Control directo por peso de balanza comercial: `Plástico Neto = Peso Bruto - Tara de la Marca`.
- **Consumo Atómico:** Comprar en la web no descuenta filamento. El inventario real solo se consume de forma atómica y transaccional cuando el administrador acciona el disparador **"Registrar Fabricación"**.
- **Auditoría Total:** Cada gramo consumido o ajustado manualmente genera un registro inmutable en `FilamentLog` para trazabilidad completa de mermas.

### 3. Workflow de Pedidos por Máquina de Estados
Los pedidos transicionan de forma segura a través de un ciclo lógico estrictamente validado en el backend:
`PENDING ➔ CONFIRMED ➔ IN_PRODUCTION ➔ PREPARING ➔ SHIPPED ➔ DELIVERED`

### 4. Webhooks Firmados y Conciliación Automatizada
Para mitigar fraudes o cierres accidentales del navegador por parte del cliente, el flujo de pago no depende de redirecciones web (`back_urls`). El backend implementa un endpoint seguro que recibe las notificaciones asíncronas de **Mercado Pago (IPN)**, validando criptográficamente la firma digital del servidor de pagos antes de liberar una orden.

---

## 📊 Arquitectura de Datos (Prisma Schema)

El modelo relacional en PostgreSQL está optimizado para evitar redundancias y mantener la integridad referencial:

| Entidad | Propósito del Sistema |
| :--- | :--- |
| `User` | Gestión de cuentas y control de accesos por roles (`CLIENT` / `ADMIN`). |
| `Category` | Organización del catálogo público con identidad visual (`colorHex`). |
| `Product` | Catálogo comercial: precios, stock web, peso, dimensiones y parámetros de impresión. |
| `Filament` | Bobinas físicas en taller: tracking de peso neto inicial (1000g), peso actual y precio/kg. |
| `ProductFilamentUsage` | Tabla intermedia (Receta Técnica). Relaciona qué filamentos consume cada pieza. |
| `FilamentLog` | Libro diario de auditoría de stock de materiales. |
| `Cart` / `CartItem` | Persistencia del estado de compra del cliente (Soporta usuarios invitados vía `sessionId`). |
| `Order` / `OrderItem` | Congelamiento de datos de facturación, pasarela de pagos y logística de Envíopack. |

---

## 🏆 Desafíos de Ingeniería Resueltos

### ⚙️ Pipeline Automatizado de Migración Local-to-Cloud
Al migrar el sistema comercial a la nube (**Neon**), se presentó el desafío de trasladar toda la base de datos de desarrollo (con clientes, órdenes históricas y stock real) sin romper las restricciones de claves foráneas (*Foreign Keys*).

Para resolverlo, diseñé un pipeline automatizado en TypeScript compuesto por dos fases:
1. **Extracción Paralela (`scripts/export-data.ts`):** Extrae de forma asíncrona y simultánea las 11 tablas del entorno local generando un archivo estructurado seguro (`backup_real.json`).
2. **Inyección Jerárquica (`prisma/seed.ts`):** Un motor de siembra que procesa el JSON e inyecta la información en la base de datos productiva de Neon respetando estrictamente el árbol de dependencia relacional:
   - *Fase Primaria:* `User` ➔ `Category` ➔ `Supplier`
   - *Fase Secundaria:* `Filament` ➔ `Product`
   - *Fase Terciaria:* `ProductFilamentUsage` ➔ `FilamentLog` ➔ `Order` ➔ `Cart`
   - *Fase Cuaternaria:* `OrderItem` ➔ `CartItem`
   
Este diseño garantizó una migración con **cero violaciones de integridad referencial** y un tiempo de caída del sistema nulo.

---

## 📂 Estructura del Proyecto

```text
hacedor-3d/
├── frontend/🏢      # SPA construida con React, Vite y Zustand
└── backend/⚙️       # API REST construida con Express y Prisma ORM
    ├── src/
    │   ├── routes/       # Capa de Endpoints (/api/auth, /api/products, etc.)
    │   ├── middlewares/  # Control de accesos por JWT, CORS y validaciones Zod
    │   ├── controllers/  # Lógica de control y respuestas HTTP
    │   ├── services/     # Núcleo de negocio (Costeos, MercadoPago, Envíopack)
    │   └── schemas/      # Contratos de datos estructurados con Zod
    ├── prisma/           # Archivo de esquema e historial de migraciones
    └── scripts/          # Automatizaciones de bases de datos y backups
`````

🚀 Instalación y Configuración Local
Si deseás replicar este entorno de desarrollo de forma local, seguí estos pasos:
	1.	Clonar el repositorio:

```bash
git clone [https://github.com/tu-usuario/hacedor-3d.git](https://github.com/tu-usuario/hacedor-3d.git)
cd hacedor-3d
```

2.	Configurar el Entorno del Servidor (Backend):
Navegá a la carpeta backend, instalá las dependencias y crea un archivo .env basado en las variables requeridas:

```bash
cd backend
npm install
```

Variables requeridas en backend/.env:

```env
DATABASE_URL="postgresql://..."
JWT_SECRET="tu_secreto_jwt"
MERCADOPAGO_ACCESS_TOKEN="TEST-..."
CLOUDINARY_CLOUD_NAME="..."
```

3.	Ejecutar Migraciones y Levantar Servidor:

```bash
npx prisma migrate dev
npm run dev
```

4.	Configurar el Cliente (Frontend):
En otra terminal, ingresá a la carpeta frontend, instalá dependencias y levantá el servidor de desarrollo de Vite:

```bash
cd frontend
npm install
npm run dev
```

---

## 🔑 Acceso de Prueba (Demo de Administración)

Para explorar las métricas del Dashboard, gestionar el stock físico de filamentos y utilizar el simulador de costos avanzado, podés iniciar sesión en la plataforma con las siguientes credenciales de prueba:

- 📧 **Email de Administrador:** `ian@hacedor3d.com`
- 🔒 **Contraseña:** `admin1234`

### 📖 Guía rápida de exploración para Reclutadores:
1. **Auditoría de Costos:** Entrá a la sección de *Productos*, editá cualquiera o creá uno nuevo. Vas a ver cómo el sistema calcula en tiempo real el costo de material, energía y el "Diezmo" del 10% según los gramos y horas de impresión que indiques.
2. **Control de Balanza:** En la sección *Filamentos*, vas a ver el inventario real de bobinas. Podés simular un pesaje restando gramos a una bobina y verás cómo impacta en las barras de progreso cromáticas y en el historial de auditoría (`FilamentLog`).
3. **Flujo de Producción:** Si realizás una compra simulada en la tienda, podés ir al *Panel de Órdenes* como administrador para avanzar el estado del pedido a `IN_PRODUCTION`. Al hacer clic en **"Registrar Fabricación"**, verás cómo el backend descuenta de forma atómica los gramos de plástico exactos del inventario físico.

---

Desarrollado con dedicación por Ian Moreno - Full Stack Developer enfocado en soluciones eficientes y escalables para el sector industrial.

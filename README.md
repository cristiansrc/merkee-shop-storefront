# merkee-shop-storefront

Portal de tienda (**storefront**) del ecosistema **merkee.shop** — un
supermercado digital colombiano. Es una **React SPA + TypeScript** con
**Redux Toolkit** como única fuente de estado de vista.

> Parte del workspace `merkee-workspace`. Consume el contrato
> `docs/api/openapi.yaml` vía un cliente generado/tipado.

## Objetivo y alcance

Interfaz de compra para **visitantes** y **clientes**:

- **Navegación** y catálogo (categorías, banners, productos paginados, búsqueda,
  detalle).
- **Carrito servidor** para guest y cliente, con reserva de inventario (Redux
  contiene solo vista derivada; el carrito vive en el API).
- **Auth**: registro (solo `cliente`), login, logout, perfil (`display_name`,
  `phone`), recuperación y cambio de contraseña.
- **Checkout de cinco pasos**: identificación/invitado → dirección de entrega →
  proveedor de pago → confirmación → resultado; calcula IVA 19% y entrega 5000
  COP en el API.
- **Proveedores de pago**: Wompi / Mercado Pago (selección en el checkout;
  tokenizado en el proveedor).
- **Órdenes**: listado y detalle de las propias del cliente.

## Stack y principios

- **React 19 + TypeScript**, **Vite**, **Redux Toolkit** (`@reduxjs/toolkit`,
  `react-redux`), **React Router v7**.
- **es-CO / COP**: UI y mensajes en español colombiano; precios en pesos
  colombianos enteros.
- **Responsive**: diseño adaptable; objetivo mínimo de referencia **iPhone SE
  (2020)**. Accesibilidad básica (estados loading/error/empty, foco, roles).
- **Sin persistencia de tokens/carrito en navegador**: el JWT de acceso vive
  solo en memoria; el refresh/cart token es cookie `HttpOnly` del servidor.
  **No se usa `localStorage` ni `sessionStorage`** para tokens ni para el
  carrito.

## Estructura relevante (disco)

```
src/
├── api/
│   ├── client.ts        # Cliente HTTP tipado (OpenAPI)
│   └── mocks.ts         # Datos mock para desarrollo offline
├── components/          # CartPanel, CheckoutSteps, LoginForm, ProductCard, …
├── pages/               # Home, Products, ProductDetail, Categories,
│                       # Checkout, Orders, OrderDetail, Profile, Auth, …
├── store/               # Redux: authSlice, cartSlice, catalogSlice,
│                       # checkoutSlice, ordersSlice, profileSlice
└── types/               # Tipos del contrato
```

## Mocks vs API real

El proyecto puede funcionar con **mocks** (`src/api/mocks.ts`) o contra la API
real, controlado por variables de entorno:

| Variable | Descripción | Valor en `.env.example` |
|---|---|---|
| `VITE_API_BASE_URL` | URL base del API (sin trailing slash). | `https://api.merkee.shop/v1` |
| `VITE_USE_MOCKS` | `true` fuerza mocks; `false` usa la API real. | `false` |

Para desarrollo contra la API real: `VITE_USE_MOCKS=false` y
`VITE_API_BASE_URL` apuntando al API (local `http://localhost:3000/v1` o el
host de despliegue).

## Cómo ejecutar localmente

Requisitos: Node.js, `npm`.

```bash
npm install
cp .env.example .env      # ajustar VITE_API_BASE_URL / VITE_USE_MOCKS
npm run dev               # servidor de desarrollo Vite
npm run build             # tsc -b && vite build
npm run preview           # previsualizar build de producción
```

## Tests, build y lint

```bash
npm run dev               # desarrollo
npm run build             # build de producción
npm run lint              # oxlint
npm test                  # vitest run (unitarias)
npm run test:watch        # vitest en modo watch
```

- **Pruebas:** hay pruebas unitarias presentes (Vitest) para páginas
  (`HomePage`, `ProductsPage`, `ProductDetailPage`) y para los slices de Redux
  (`authSlice`, `catalogSlice`, `checkoutSlice`, `ordersSlice`, `profileSlice`).
  La **cantidad exacta y la cobertura medida no están registradas en los
  artefactos revisados**; no se afirma un porcentaje concreto.
- **Pendientes:** ampliar cobertura de componentes y del flujo de checkout de 5
  pasos; conectar la API real de forma estable. Los módulos del API
  (catálogo/carrito/checkout/órdenes/pagos) **ya tienen implementación local**,
  pero dependen de servicios externos no configurados (S3/media, Wompi/Mercado
  Pago, email) que hoy corren con adapters fake en dev; el flujo de compra real
  completo requiere esos servicios productivos.

## Estado de AWS (rehidratado 2026-08-21; histórico 2026-08-18)

El storefront se sirve como SPA estática hospedada en un **bucket S3 privado
detrás de CloudFront/OAC** (ADR-006). **AWS configurado** en cuenta de aprendizaje,
región `us-east-1`, un único ambiente: bucket `merkee-frontend-client` con
distribución CloudFront `E32P11SX9DFU82` → `merkee.shop` desplegados. DNS gestionado
en Spaceship; `api.merkee.shop` y `admin.merkee.shop` existen; `swagger.merkee.shop`
pendiente de distribución/origen. **Verificado 2026-08-21:** `merkee.shop` 301→
`www.merkee.shop` 200, CORS allowlist + PUT operativo (`7fdb009`), `PUT
/cart/items/{productId}` y checkout con `guest_session_id` (commits `b37b280`,
`acd8cbc`), auth con refresh silencioso (`04cdeaf`, `0090288`, `a82f8d5`).
**Histórico 2026-08-18:** entrega con API local OK pero AWS no operativo (ECR 0,
ECS 1/0, puertos/health desalineados, admin mocks forzados, carrito guest roto,
checkout stub, imágenes `url` vacía, sesión 10m). **Postentrega 2026-08-21:**
ECS estable, ECR publicado, media `images.merkee.shop` OAC (`02167cd`), sesión
30m (`580ff8f`). No se afirma despliegue productivo terminado; **no se declara
producción lista** — gates RDS público, observabilidad y legal siguen abiertos.
No se solicitan secretos por chat. Ver `../../README.md` y
`../../docs/DEPLOYMENT_STATUS.md` (trazabilidad histórica + estado verificado
2026-08-21, fechado, puede cambiar).

## Notas

- El admin **no compra** y es una SPA separada (`merkee-shop-admin`); este
  storefront es exclusivamente para visitantes/clientes.
- No se almacenan PAN/CVV; el pago se tokeniza en el proveedor.

## Pendientes de decisión

- **Dependencias de servicios externos:** el storefront consume el API real
  cuando `VITE_USE_MOCKS=false`. Los módulos del API (catálogo, carrito,
  checkout, órdenes, pagos) ya están implementados localmente, pero sus adapters
  de media (S3), pago (Wompi/Mercado Pago) y email corren en modo fake/dev
  porque AWS y los proveedores no están configurados; el flujo de compra
  productivo requiere esos servicios.
- **Cobertura:** definir y registrar un gate de cobertura explícito para el
  proyecto (hoy no hay `coverageThreshold` configurado). **La cobertura completa
  independiente del storefront sigue pendiente de medición final**; no se afirma
  un porcentaje concreto.

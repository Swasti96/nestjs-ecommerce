# E-commerce Backend — Challenge Sr Fullstack

Sistema de e-commerce con arquitectura orientada a eventos, construido sobre NestJS y PostgreSQL. Evolucionado desde un monolito con problemas de diseño hacia un modelo event-driven con comunicación en tiempo real via WebSockets.

## URLs públicas

| Servicio    | URL                                                              |
| ----------- | ---------------------------------------------------------------- |
| Frontend    | https://nestjs-ecommerce-production-a659.up.railway.app          |
| Backend API | https://nestjs-ecommerce-production-e984.up.railway.app          |
| Swagger     | https://nestjs-ecommerce-production-e984.up.railway.app/api/docs |

---

## Credenciales de prueba

| Usuario       | Email             | Password  | Rol      |
| ------------- | ----------------- | --------- | -------- |
| Merchant demo | merchant@demo.com | Demo1234! | Merchant |
| Admin         | admin@admin.com   | 12345678  | Admin    |

El seed carga automáticamente un producto demo activo (ID 1 — Laptop Demo XPS 15) con 2 variaciones de color y stock de 10 unidades cada una.

---

## Cómo levantar el proyecto

### Requisitos

- Node.js 18+
- Docker y Docker Compose
- npm 9+

### Backend

```bash
cd backend
docker compose up -d        # Levanta PostgreSQL
npm install
npm run migration:run       # Crea las tablas
npm run seed:run            # Carga datos iniciales
npm run start:dev           # Servidor en http://localhost:3000
```

### Frontend

```bash
cd frontend
npm install
npm start                   # Abre en http://localhost:3001
```

> React preguntará si usar otro puerto si el 3000 está ocupado — respondé Y.

---

## Problemas detectados en el repositorio original

### Arquitectura

- **Sin módulo de inventario**: la entidad `Inventory` existía pero no tenía controller, service ni module. Era una entidad huérfana sin endpoints ni lógica de negocio.
- **`EntityManager` global**: todos los services usaban `@InjectEntityManager()` accediendo a cualquier entidad directamente, acoplando la lógica de negocio a la infraestructura.
- **Sin capa de eventos**: no había ningún mecanismo de comunicación desacoplada entre módulos.

### Diseño

- **Validators mezclados con entidades**: decoradores de `class-validator` (`@IsDefined`, `@IsString`) aplicados sobre entidades TypeORM. Las validaciones de input deben vivir en los DTOs, no en las entidades de persistencia.
- **`activateProduct` sin evento**: el punto más natural del dominio para disparar un evento no hacía nada más que actualizar una columna.
- **`validate()` roto conceptualmente**: intentaba validar una entidad de base de datos con `class-validator`, pero las columnas son `nullable: true` en la DB y `@IsDefined()` en el decorador, haciendo que la validación siempre fallara.

### Implementación

- **`JwtModule` con `process.env` en tiempo de carga**: registrado con `JwtModule.register({ secret: process.env.JWT_SECRET })` antes de que `ConfigModule` cargue el `.env`. Resultado: `JWT_SECRET` era siempre `undefined` y todos los tokens fallaban la verificación.
- **`AuthGuard` usando `process.env` directamente**: el guard verificaba el token con `process.env.JWT_SECRET` en lugar de `ConfigService`, misma causa raíz.
- **Sin CORS ni Swagger**: imposibilitaba el consumo desde un frontend en otro origen y la exploración de la API.

---

## Eventos de dominio implementados

### `product.activated`

Se emite cuando un merchant activa un producto (pasa de borrador a publicado).

**Por qué**: es el punto más natural del dominio donde el catálogo necesita notificar al inventario. En lugar de que `ProductService` llame directamente a `InventoryService` (acoplamiento directo), emite un evento que el módulo de inventario consume de forma desacoplada.

**Flujo**:

```
POST /product/:id/activate
  → ProductService valida que el producto esté completo
  → Actualiza isActive = true en DB
  → Emite product.activated
  → ProductActivatedListener crea Inventory con quantity: 0 para cada variación
  → InventoryGateway pushea el evento a todos los clientes WebSocket conectados
```

### `inventory.updated`

Se emite cuando el stock de una variación cambia.

**Por qué**: desacopla quién modifica el stock de quién reacciona a ese cambio. El listener actual loguea el movimiento, pero es el punto de extensión natural para notificaciones, alertas de stock bajo, auditoría, etc., sin modificar el service de inventario.

**Flujo**:

```
PATCH /inventory/:id/stock
  → InventoryService actualiza quantity en DB
  → Emite inventory.updated con { productVariationId, previousQuantity, newQuantity, reason }
  → InventoryUpdatedListener loguea el movimiento
  → InventoryGateway pushea el evento a todos los clientes WebSocket conectados
  → Frontend recibe el evento y hace refetch inmediato
```

---

## Decisiones técnicas relevantes

### WebSocket con polling como fallback

El frontend usa WebSocket como fuente principal de actualizaciones en tiempo real. Si la conexión se pierde (red inestable, proxy que corta conexiones largas, redeploy del servidor), el badge cambia automáticamente a "Polling fallback" y activa polling cada 60 segundos. Cuando el WebSocket se reconecta, el polling se deshabilita solo.

Esta decisión sigue el principio de **graceful degradation**: el sistema nunca falla completamente, se degrada al siguiente nivel disponible. El intervalo de 60 segundos hace que el polling sea claramente secundario y no compita con el WebSocket en condiciones normales.

### `JwtModule.registerAsync` con `global: true`

Reemplazó `JwtModule.register()` para garantizar que el secret se lea una vez que `ConfigModule` ya procesó el archivo de entorno. El `global: true` como opción del `registerAsync` (no dentro del factory) asegura que `JwtService` esté disponible en todos los módulos sin importarlo explícitamente.

### `typeOrm.config.ts` con carga condicional de `.env`

En desarrollo carga el archivo `development.env` via `dotenv`. En producción (`NODE_ENV=production`) usa directamente las variables de entorno del sistema, que es como Railway (y cualquier plataforma de hosting) las inyecta. Esto elimina la dependencia de archivos de configuración en el filesystem en producción.

### `DemoSeeder` al final del pipeline

Depende de roles, categorías, colores y talles para funcionar. Corre siempre último y es idempotente — verifica si el producto demo ya existe antes de crearlo, por lo que puede correr múltiples veces sin duplicar datos.

### Eventos como clases TypeScript

Los eventos se definen como clases en lugar de objetos planos. Esto permite tipar el payload del evento, hacer `instanceof` checks en listeners genéricos, y documentar claramente qué datos viajan en cada evento.

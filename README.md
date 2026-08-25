# Stock Kiosco

App de control de stock para kioscos. **PWA instalable**, con **sincronización en vivo entre dispositivos** (celular, tablet, PC) usando Supabase.

## 🚀 Puesta en marcha (una sola vez)

### 1. Crear el backend en Supabase (gratis)
1. Entrá a [supabase.com](https://supabase.com) y creá una cuenta + un proyecto nuevo.
2. En el panel del proyecto, andá a **SQL Editor → New query**, pegá todo el contenido de
   [`supabase/schema.sql`](./supabase/schema.sql) y apretá **Run**.
   Esto crea las tablas (`productos`, `categorias`, `movimientos`), la seguridad por usuario (RLS)
   y la función `ajustar_stock` que hace las ventas/reposiciones sin pisar datos entre dispositivos.
3. Andá a **Authentication → Providers** y confirmá que **Email** esté habilitado (login por magic link,
   sin contraseña).
4. Andá a **Project Settings → API** y copiá:
   - **Project URL**
   - **anon public key**

### 2. Configurar la app
Abrí `supabase-config.js` y pegá ahí esos dos valores:

```js
const SUPABASE_URL = "https://TU-PROYECTO.supabase.co";
const SUPABASE_ANON_KEY = "TU-ANON-KEY-ACA";
```

### 3. Publicar
Subí la carpeta a Netlify, Vercel, Cloudflare Pages o GitHub Pages (con HTTPS).
En **Authentication → URL Configuration** de Supabase, agregá la URL pública como
"Redirect URL" para que el magic link funcione.

### 4. Usarla
Entrá desde el celular, la tablet y la PC, ingresá con el mismo email en cada uno.
Cualquier venta, reposición o edición que hagas en un dispositivo aparece **al instante**
en los demás (sin recargar la página) — es Supabase Realtime.

---

## Cómo se actualiza el stock "en vivo"

- **Botón "−" en la tarjeta** → registra una **venta** (resta 1 al stock).
- **Botón "+" en la tarjeta** → registra un **ingreso** (reponer mercadería, suma 1).
- **Click en el número de stock** → abre el ajuste manual (corregir un conteo, ±10/±5/±1 o valor exacto).

Todos estos movimientos quedan guardados en la tabla `movimientos` (con tipo `venta` / `ingreso` / `ajuste`),
así queda un historial de qué pasó con cada producto.

La actualización de stock usa una función de base de datos (`ajustar_stock`) que hace el cambio de forma
atómica: si dos personas venden el mismo producto al mismo tiempo desde dos celulares distintos, el stock
resultante es correcto igual — no se pisa una venta con la otra.

---

## Qué tiene hoy

- ✅ Login por email (sin contraseña) — cada kiosco ve solo sus propios datos
- ✅ Stock sincronizado en vivo entre todos los dispositivos (Supabase Realtime)
- ✅ Venta / reposición / ajuste con historial de movimientos
- ✅ Fotos, precio de compra/venta y margen
- ✅ Categorías configurables
- ✅ Alertas y filtro de stock bajo
- ✅ Export CSV
- ✅ Tema claro/oscuro
- ✅ PWA instalable + cache offline de la interfaz (los datos requieren conexión)
- ✅ Onboarding de primera vez

## Roadmap para seguir comercializando

### Corto plazo
- Reportes: qué se vendió hoy/esta semana, producto más vendido, margen del mes
  (ya está la data en `movimientos`, falta la pantalla)
- Modo "vender varias unidades de una" más rápido (carrito simple)
- Cola de acciones pendientes cuando no hay internet, para no perder ventas offline

### Mediano plazo
- Roles: dueño / empleado (empleado no puede editar precios ni eliminar productos)
- Multi-local (un mismo dueño con más de un kiosco)
- Códigos de barras (escaneo con la cámara)
- Plan free limitado + plan Pro mensual

---

## Estructura

```
kiosco-stock/
├── index.html
├── styles.css
├── app.js
├── supabase-config.js   ← completar con tu URL y anon key
├── supabase/
│   └── schema.sql       ← correr una vez en el SQL Editor de Supabase
├── sw.js                ← service worker (offline de la interfaz)
├── manifest.json        ← PWA
├── icons/
└── README.md
```

## Nota técnica

Los datos viven en Supabase (Postgres), no en el navegador. Cada dispositivo se autentica
con el mismo email y ve/edita los mismos productos en tiempo real gracias a Supabase Realtime,
protegidos por Row Level Security (cada usuario solo accede a sus propias filas).

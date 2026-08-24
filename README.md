# Stock Kiosco

App de control de stock para kioscos. **PWA instalable** — funciona en celular, tablet y PC.

## Cómo usarla ya

### Opción rápida (probar)
1. Descomprimí la carpeta
2. Abrí `index.html` en el navegador  
   ⚠️ El modo offline / “Instalar app” **no funciona** abriendo el archivo directo (`file://`). Para eso necesitás un servidor local o hosting.

### Probar como app de verdad (recomendado)
En la carpeta del proyecto:

```bash
# Con Python
python3 -m http.server 8080

# O con Node
npx serve .
```

Después abrí `http://localhost:8080` en el celular (misma wifi) o en la PC.  
En Chrome/Edge debería aparecer **“Instalar app”**.

### Publicarla online (gratis para empezar)
Subí la carpeta a:
- [Netlify Drop](https://app.netlify.com/drop) (arrastrás la carpeta)
- [Cloudflare Pages](https://pages.cloudflare.com/)
- [Vercel](https://vercel.com/)
- GitHub Pages

Con HTTPS, el botón **Instalar** y el modo offline funcionan bien.

---

## Qué tiene hoy (fase comercial 1)

- ✅ Control de stock con fotos, compra/venta y margen
- ✅ Categorías configurables
- ✅ Alertas y filtro de stock bajo
- ✅ Export CSV
- ✅ Tema claro/oscuro
- ✅ PWA instalable + cache offline de la app
- ✅ Onboarding de primera vez
- ✅ Datos locales (localStorage)

## Roadmap para venderlo

### Fase 2 — Multi-dispositivo (prioridad)
- Cuenta de usuario (email / Google)
- Base de datos en la nube (Supabase o Firebase)
- Sincronización entre celu, tablet y PC
- Roles: dueño / empleado

### Fase 3 — Ventas
- Modo “vender” (descuenta stock)
- Historial de movimientos
- Reportes simples (qué se vende, margen del mes)

### Fase 4 — Monetización
- Plan free limitado + plan Pro mensual
- Multi-local
- Códigos de barras

---

## Estructura

```
kiosco-stock/
├── index.html
├── styles.css
├── app.js
├── sw.js              ← service worker (offline)
├── manifest.json      ← PWA
├── icons/
│   ├── icon-192.png
│   ├── icon-512.png
│   └── apple-touch-icon.png
└── README.md
```

## Nota técnica

Los datos viven en el navegador del usuario.  
Para comercializar en serio hay que pasar a backend + auth (fase 2).

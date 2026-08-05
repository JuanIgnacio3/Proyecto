# Guía de despliegue — Sistema Institucional CTP San Pedro de Barva

Documento operativo para llevar el sistema a producción. Reúne **todo lo que
debe configurarse fuera del código**: variables de entorno, CORS, HTTPS, DNS y
los metadatos SEO que dependen del dominio oficial.

> Regla de oro: el código **no contiene** secretos ni el dominio. Todo lo
> específico del entorno se define aquí, al desplegar.

---

## 1. Dominio oficial

Mientras **no exista** un dominio confirmado, el sitio se sirve sin ninguna
referencia absoluta a sí mismo (no hay `canonical`, `og:url`, `sitemap.xml` ni
línea `Sitemap:` en `robots.txt`). Esto es **intencional**: una URL absoluta
falsa perjudica el SEO más que su ausencia.

Cuando el dominio se confirme (ejemplo: `https://www.ctpsanpedrobarva.cr`),
realizar los cambios de las secciones siguientes. **Sustituir en todos los
casos `https://TU-DOMINIO` por el dominio real, con `https://` y sin barra final
salvo donde se indique.**

---

## 2. SEO / dominio

Los siguientes elementos se **eliminaron a propósito** y deben **volver a
agregarse** una vez definido el dominio.

### 2.1 `canonical` — `tailwind-admin-reactjs-free/package/index.html`

En el `<head>`, donde hoy hay un comentario que dice
`canonical: se agrega al definir el dominio oficial`, agregar:

```html
<link rel="canonical" href="https://TU-DOMINIO/" />
```

### 2.2 `og:url` y `og:image` — mismo `index.html`

Junto a las demás etiquetas Open Graph (después de `og:locale`), agregar:

```html
<meta property="og:url" content="https://TU-DOMINIO/" />
<meta property="og:image" content="https://TU-DOMINIO/og-image.jpg" />
<meta name="twitter:image" content="https://TU-DOMINIO/og-image.jpg" />
```

La imagen debe ser **1200×630 px**, institucional y real (ver §9).

### 2.3 `sitemap.xml` — `tailwind-admin-reactjs-free/package/public/sitemap.xml`

El archivo se eliminó (no puede ser válido sin dominio). Crearlo de nuevo con
las URLs absolutas reales del sitio público:

```xml
<?xml version="1.0" encoding="UTF-8"?>
<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">
  <url>
    <loc>https://TU-DOMINIO/inicio</loc>
    <changefreq>monthly</changefreq>
    <priority>1.0</priority>
  </url>
</urlset>
```

> Ampliar con una entrada por cada ancla/sección pública que quiera indexarse.

### 2.4 `robots.txt` — `tailwind-admin-reactjs-free/package/public/robots.txt`

Agregar al final la línea `Sitemap:` (requiere URL absoluta):

```
Sitemap: https://TU-DOMINIO/sitemap.xml
```

### 2.5 JSON-LD — `index.html`

El bloque `application/ld+json` (EducationalOrganization) ya es válido sin
dominio. Opcionalmente, agregar dentro del objeto:

```json
"url": "https://TU-DOMINIO/",
"logo": "https://TU-DOMINIO/logo.png"
```

### Metadatos que YA son válidos sin dominio (no tocar)

`title`, `description`, `theme-color`, Open Graph (excepto `og:url`/`og:image`),
Twitter Card (excepto `twitter:image`), `favicon`, `manifest` y el resto del
JSON-LD.

---

## 3. Variables de entorno (backend)

Se definen en `backend/.env` (nunca se committea). Plantilla completa y
documentada en `backend/.env.example`.

| Variable | Obligatoria | Descripción |
|---|---|---|
| `SECRET_KEY` | **Sí** | Clave de firma JWT, ≥32 chars. La app **no arranca** sin ella o con un valor inseguro. Generar con `openssl rand -hex 32`. Única por entorno. |
| `DATABASE_URL` | **Sí** | Cadena de conexión PostgreSQL. Sin valor por defecto en el código. |
| `POSTGRES_USER` / `POSTGRES_PASSWORD` / `POSTGRES_DB` | **Sí** | Credenciales del contenedor de base de datos. Usar contraseña fuerte y única en producción. |
| `BACKEND_CORS_ORIGINS` | **Sí (prod)** | Orígenes permitidos, coma-separados. Ver §4. |
| `ACCESS_TOKEN_EXPIRE_MINUTES` | No | Vigencia del token (por defecto 1440 = 24 h). |
| `LOG_LEVEL` | No | `DEBUG`/`INFO`/`WARNING`/`ERROR` (por defecto `INFO`). |
| `SEED_ADMIN_EMAIL` / `SEED_ADMIN_PASSWORD` | Recomendada | Credenciales del administrador inicial que crea el seed. Si no se definen, se usa una contraseña por defecto que **debe cambiarse de inmediato**. |

Generar el secreto:

```bash
openssl rand -hex 32
```

---

## 4. CORS

Configurado **100 % por entorno** (`BACKEND_CORS_ORIGINS`), sin `localhost` en el
código. Valor coma-separado, sin espacios:

```
# Desarrollo
BACKEND_CORS_ORIGINS=http://localhost:5173

# Producción
BACKEND_CORS_ORIGINS=https://TU-DOMINIO,https://www.TU-DOMINIO
```

Incluir **todos** los orígenes desde los que se sirve el frontend (con y sin
`www`, si aplica).

---

## 5. HTTPS / certificados

La aplicación está pensada para ejecutarse **detrás de un reverse proxy** (Nginx
o Caddy) que termina TLS. El backend habla HTTP en la red interna; el proxy
expone HTTPS al exterior.

Pasos al desplegar:

1. Instalar el reverse proxy (Nginx o Caddy) en el host.
2. Emitir certificados con **Let's Encrypt** (`certbot` para Nginx, automático
   en Caddy) para `TU-DOMINIO` y `www.TU-DOMINIO`.
3. Configurar el proxy para:
   - Redirigir `http://` → `https://`.
   - Servir el build estático del frontend (`dist/`).
   - Enrutar `/api/` hacia el backend (`http://backend:8000`).
   - Reenviar la cabecera `X-Forwarded-For` (el rate limiting por IP la usa).
4. Renovación automática de certificados (cron de `certbot` o Caddy nativo).

> El backend **no gestiona certificados**: es responsabilidad del proxy.

---

## 6. DNS

Antes de emitir certificados, apuntar el dominio al servidor de producción:

| Registro | Nombre | Valor |
|---|---|---|
| `A` | `@` (raíz) | IP pública del servidor |
| `A` o `CNAME` | `www` | IP del servidor o el dominio raíz |

Esperar la propagación DNS antes de solicitar los certificados TLS.

---

## 7. Base de datos en producción

- Usar `POSTGRES_PASSWORD` fuerte y único.
- **No exponer** el puerto 5432 al exterior (solo red interna del compose).
- Ejecutar las migraciones antes de levantar tráfico:
  `alembic upgrade head`.
- Ejecutar el seed una única vez con `SEED_ADMIN_*` definidos y **cambiar la
  contraseña del administrador** tras el primer acceso.

---

## 8. Favicon definitivo

Hoy se usa `favicon.svg`. Para compatibilidad total, agregar en
`tailwind-admin-reactjs-free/package/public/`:

- `favicon.ico` (multi-tamaño).
- `apple-touch-icon.png` (180×180).
- Iconos PWA `192×192` y `512×512` (referenciados en `site.webmanifest`).

Y en `index.html`, junto a los `<link rel="icon">` existentes:

```html
<link rel="icon" type="image/png" sizes="32x32" href="/favicon-32x32.png" />
<link rel="apple-touch-icon" href="/apple-touch-icon.png" />
```

---

## 9. og:image

Imagen para previsualizaciones en redes sociales:

- Tamaño **1200×630 px**, formato JPG/PNG.
- Contenido institucional real (fachada, logo, estudiantes en taller).
- Colocar en `public/og-image.jpg` y referenciar según §2.2.

---

## 10. Checklist final antes del deploy

- [ ] `SECRET_KEY` fuerte y único definido.
- [ ] Credenciales de base de datos fuertes; puerto 5432 no expuesto.
- [ ] `BACKEND_CORS_ORIGINS` con el dominio real.
- [ ] DNS apuntando al servidor y propagado.
- [ ] Reverse proxy con HTTPS y `X-Forwarded-For`.
- [ ] Migraciones aplicadas (`alembic upgrade head`).
- [ ] Seed ejecutado y contraseña del admin cambiada.
- [ ] Dominio configurado en: `canonical`, `og:url`, `og:image`, `sitemap.xml`,
      `robots.txt`, JSON-LD (§2).
- [ ] Favicon definitivo y `og:image` reales agregados.
- [ ] Contenido editorial validado con el colegio.

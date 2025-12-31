# Informe de Rediseño: Coexistencia Pentamont & iCards

Este documento detalla los cambios realizados en el proyecto **Alquileres (Pentamont)** para permitir su funcionamiento simultáneo con la aplicación **iCards** en el dominio `icards.fun`.

## 1. Problema Identificado
Las dos aplicaciones compartían el mismo dominio, lo que provocaba colisiones en el `localStorage`. Al compartir claves genéricas como `token` o `user`, la sesión de una app invalidaba la de la otra, disparando redirecciones no deseadas a `/pentamont/login`.

## 2. Cambios Implementados (Pentamont)

### A. Aislamiento de Storage
Se han modificado los contextos de autenticación y API para usar claves únicas:
- **Antes:** `token`, `user`
- **Ahora:** `pentamont_token`, `pentamont_user`

**Archivos afectados:**
- `web/src/contexts/AuthContext.tsx`
- `web/src/contexts/ApiContext.tsx`

### B. Redirecciones Dinámicas
Se eliminaron las rutas estáticas hardcoded para evitar que la app asuma su ubicación en el servidor.
- Se implementó el uso de `import.meta.env.BASE_URL` (configurado en Vite como `/pentamont/`).
- Las redirecciones al login ahora son relativas y dinámicas.

## 3. Propuesta de Configuración NGINX (Golden Master)

Se recomienda simplificar el archivo `/etc/nginx/sites-enabled/alquileres-simple.conf` para eliminar los `rewrite` y usar un mapeo directo:

```nginx
# Configuración recomendada para icards.fun
server {
    listen 443 ssl;
    server_name icards.fun www.icards.fun;

    # --- APP 1: ALQUILERES (PENTAMONT) ---
    # API: Mapeo automático /pentamont/api/ -> backend:4000/api/
    location ^~ /pentamont/api/ {
        proxy_pass http://127.0.0.1:4000/api/;
        proxy_http_version 1.1;
        proxy_set_header Host $host;
        proxy_set_header X-Real-IP $remote_addr;
        add_header Cache-Control "no-store, no-cache, must-revalidate";
    }

    # FRONTEND: Servido desde el puerto 4001
    location /pentamont/ {
        proxy_pass http://127.0.0.1:4001/;
        proxy_http_version 1.1;
        proxy_set_header Host $host;
    }

    # --- APP 2: ICARDS (RAÍZ) ---
    location /api/ {
        proxy_pass http://127.0.0.1:3000/;
        proxy_http_version 1.1;
        proxy_set_header Host $host;
    }

    location / {
        proxy_pass http://127.0.0.1:5173;
        proxy_http_version 1.1;
        proxy_set_header Upgrade $http_upgrade;
        proxy_set_header Connection 'upgrade';
    }
}
```

## 4. Próximos Pasos Coordinados
Para que la solución sea completa, la aplicación **iCards** debe aplicar cambios espejo:
1. Prefijar sus claves de storage (ej: `icards_token`).
2. Asegurar que sus redirecciones de error sean relativas a `/`.
3. Validar que no tenga rutas 'catch-all' que intercepten tráfico de `/pentamont`.

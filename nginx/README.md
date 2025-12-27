# Configuraciones de Nginx para alquileres-app

Este directorio contiene las configuraciones de Nginx para diferentes escenarios.

## Archivos Disponibles

### HTTP (Sin SSL)

1. **`alquileres-app.conf.http`** - Desarrollo
   - Proxy al puerto 5173 (Vite Dev Server)
   - Proxy al puerto 3000 (Backend API)
   - Usar cuando el frontend está en modo desarrollo

2. **`alquileres-app.conf.http.production`** - Producción
   - Sirve archivos estáticos desde `/web/dist`
   - Proxy al puerto 3000 (Backend API)
   - Usar cuando el frontend está construido

### HTTPS (Con SSL)

1. **`alquileres-app.conf.https`** - Producción con SSL
   - Sirve archivos estáticos desde `/web/dist`
   - Proxy al puerto 3000 (Backend API)
   - Redirige HTTP a HTTPS
   - Usar cuando el frontend está construido y hay certificado SSL

2. **`alquileres-app.conf.https.development`** - Desarrollo con SSL
   - Proxy al puerto 5173 (Vite Dev Server)
   - Proxy al puerto 3000 (Backend API)
   - Redirige HTTP a HTTPS
   - Usar cuando el frontend está en modo desarrollo y hay certificado SSL

## Uso

### Instalación Manual

1. Copiar el archivo de configuración apropiado:

```bash
# Para producción con SSL
cp nginx/alquileres-app.conf.https /etc/nginx/sites-available/alquileres-app.conf

# Para producción sin SSL
cp nginx/alquileres-app.conf.http.production /etc/nginx/sites-available/alquileres-app.conf

# Para desarrollo con SSL
cp nginx/alquileres-app.conf.https.development /etc/nginx/sites-available/alquileres-app.conf

# Para desarrollo sin SSL
cp nginx/alquileres-app.conf.http /etc/nginx/sites-available/alquileres-app.conf
```

2. Editar el archivo y cambiar `server_name _;` por tu dominio:

```bash
nano /etc/nginx/sites-available/alquileres-app.conf
# Cambiar: server_name _;
# Por: server_name tu-dominio.com www.tu-dominio.com;
```

3. Si usas HTTPS, actualizar las rutas de los certificados SSL:

```bash
# Buscar certificados disponibles
ls -la /etc/letsencrypt/live/

# Actualizar en el archivo de configuración
sed -i 's|/etc/letsencrypt/live/icards.fun|/etc/letsencrypt/live/tu-dominio.com|g' /etc/nginx/sites-available/alquileres-app.conf
```

4. Habilitar la configuración:

```bash
ln -s /etc/nginx/sites-available/alquileres-app.conf /etc/nginx/sites-enabled/alquileres-app.conf
```

5. Verificar y recargar:

```bash
nginx -t
systemctl reload nginx
```

### Uso Automático con GitHub Actions

El workflow de GitHub Actions (`deploy.yml`) detecta automáticamente:
- Si hay certificado SSL disponible
- Si el frontend está construido (producción) o necesita proxy (desarrollo)
- Selecciona la configuración apropiada automáticamente

## Configuración de Dominio

Antes de usar estas configuraciones, asegúrate de:

1. **Tener un dominio apuntando a tu VPS**:
   ```bash
   # Verificar DNS
   dig tu-dominio.com
   ```

2. **Para SSL (Let's Encrypt)**:
   ```bash
   # Instalar certbot
   apt-get install certbot python3-certbot-nginx
   
   # Generar certificado
   certbot --nginx -d tu-dominio.com -d www.tu-dominio.com
   ```

## Puertos

- **Frontend (Desarrollo)**: 5173 (Vite Dev Server)
- **Backend API**: 3000
- **Nginx**: 80 (HTTP) y 443 (HTTPS)

## Troubleshooting

### Ver logs de Nginx

```bash
# Logs de acceso
tail -f /var/log/nginx/alquileres-app-access.log

# Logs de errores
tail -f /var/log/nginx/alquileres-app-error.log
```

### Verificar configuración

```bash
# Verificar sintaxis
nginx -t

# Ver configuración activa
nginx -T | grep -A 20 "server_name"
```

### Reiniciar servicios

```bash
# Reiniciar Nginx
systemctl restart nginx

# Verificar estado
systemctl status nginx
```


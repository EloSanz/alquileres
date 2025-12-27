# 🚀 Comandos para Levantar la Aplicación Manualmente por SSH

Ejecuta estos comandos en orden desde tu conexión SSH al VPS.

## 1. Clonar el Repositorio

```bash
cd /var/www
git clone https://github.com/EloSanz/alquileres.git alquileres-app
cd alquileres-app
```

## 2. Verificar/Instalar Node.js

```bash
# Verificar si Node.js está instalado
node --version

# Si no está instalado:
curl -fsSL https://deb.nodesource.com/setup_20.x | bash -
apt-get install -y nodejs
```

## 3. Verificar/Instalar PostgreSQL

```bash
# Verificar si PostgreSQL está instalado
psql --version

# Si no está instalado:
apt-get update
apt-get install -y postgresql postgresql-contrib
systemctl start postgresql
systemctl enable postgresql
```

## 4. Crear Base de Datos

```bash
sudo -u postgres psql -c "CREATE DATABASE alquileres_db;" 2>/dev/null || echo "Base de datos ya existe"
```

## 5. Configurar NVM y PATH

```bash
# Cargar nvm en la sesión actual
export NVM_DIR="$HOME/.nvm"
[ -s "$NVM_DIR/nvm.sh" ] && \. "$NVM_DIR/nvm.sh"
[ -s "$NVM_DIR/bash_completion" ] && \. "$NVM_DIR/bash_completion"

# Verificar que npm está disponible
which npm
npm --version
```

## 6. Instalar Dependencias

```bash
# Asegurarse de que nvm está cargado
export NVM_DIR="$HOME/.nvm"
[ -s "$NVM_DIR/nvm.sh" ] && \. "$NVM_DIR/nvm.sh"

# Si encuentras errores ENOTEMPTY, primero limpia node_modules:
cd /var/www/alquileres-app
rm -rf node_modules package-lock.json
cd server
rm -rf node_modules package-lock.json
cd ../web
rm -rf node_modules package-lock.json

# Limpiar caché de npm (opcional pero recomendado)
npm cache clean --force

# Ahora instalar dependencias
cd /var/www/alquileres-app
npm install

# Dependencias backend
cd server
npm install

# Dependencias frontend
cd ../web
npm install
```

**Nota**: Si encuentras el error `ENOTEMPTY: directory not empty`, ejecuta los comandos de limpieza arriba antes de instalar.

## 7. Configurar Variables de Entorno

```bash
cd /var/www/alquileres-app/server

# Crear archivo .env
cat > .env << 'EOF'
DATABASE_URL="postgresql://postgres@localhost:5432/alquileres_db?schema=public"
JWT_SECRET="$(openssl rand -hex 32)"
EOF

# O editar manualmente:
# nano .env
```

**Nota**: Si prefieres generar el JWT_SECRET manualmente:
```bash
openssl rand -hex 32
```
Luego copia el resultado y pégalo en el archivo `.env`.

## 8. Configurar Base de Datos (Prisma)

```bash
cd /var/www/alquileres-app/server

# Generar cliente Prisma
npx prisma generate

# Ejecutar migraciones
npx prisma migrate deploy

# Ejecutar seed (datos iniciales)
npm run db:seed
```

## 9. Construir Aplicación

```bash
# Construir backend
cd /var/www/alquileres-app/server
npm run build

# Construir frontend
cd /var/www/alquileres-app/web
npm run build
```

## 10. Instalar Screen (para servicios)

```bash
apt-get update
apt-get install -y screen
```

## 11. Iniciar Servicios con Screen

```bash
cd /var/www/alquileres-app

# Cargar nvm antes de iniciar servicios
export NVM_DIR="$HOME/.nvm"
[ -s "$NVM_DIR/nvm.sh" ] && \. "$NVM_DIR/nvm.sh"

# Iniciar Backend
cd server
screen -dmS alquileres-backend bash -c "source ~/.nvm/nvm.sh 2>/dev/null || true; npm start || node dist/index.js"

# Esperar un momento
sleep 2

# Iniciar Frontend (con PM2 si está disponible, sino con Screen)
cd ../web

# Opción 1: Con PM2 (recomendado)
if command -v pm2 &> /dev/null; then
    pm2 delete alquileres-frontend 2>/dev/null || true
    pm2 serve dist 4001 --name alquileres-frontend --spa
    pm2 save
    echo "✅ Frontend iniciado con PM2"
else
    # Opción 2: Con Screen
    screen -dmS alquileres-frontend bash -c "npx serve -s dist -l 4001 || python3 -m http.server 4001 --directory dist"
    echo "✅ Frontend iniciado con Screen"
fi
```

## 12. Verificar Servicios

```bash
# Ver sesiones de Screen activas
screen -ls

# Ver logs del Backend
screen -r alquileres-backend

# Ver logs del Frontend (si usó Screen)
screen -r alquileres-frontend

# Ver estado de PM2 (si se usó)
pm2 status
pm2 logs alquileres-frontend
```

## 13. Configurar Nginx (Opcional)

```bash
cd /var/www/alquileres-app

# Verificar si Nginx está instalado
if ! command -v nginx &> /dev/null; then
    apt-get install -y nginx
fi

# Deshabilitar configuración por defecto
rm -f /etc/nginx/sites-enabled/default

# Determinar configuración (producción o desarrollo)
if [ -d "web/dist" ] && [ "$(ls -A web/dist 2>/dev/null)" ]; then
    USE_PRODUCTION=true
else
    USE_PRODUCTION=false
fi

# Buscar certificado SSL
SSL_CERT_DIR=$(find /etc/letsencrypt/live -mindepth 1 -maxdepth 1 -type d 2>/dev/null | head -1)

if [ -n "$SSL_CERT_DIR" ] && [ -d "$SSL_CERT_DIR" ]; then
    echo "✅ Usando HTTPS"
    if [ "$USE_PRODUCTION" = true ]; then
        CONFIG_FILE="nginx/alquileres-app.conf.https"
    else
        CONFIG_FILE="nginx/alquileres-app.conf.https.development"
    fi
    DOMAIN_NAME=$(basename "$SSL_CERT_DIR")
    sed -i "s|/etc/letsencrypt/live/icards.fun|/etc/letsencrypt/live/$DOMAIN_NAME|g" "$CONFIG_FILE" 2>/dev/null || true
else
    echo "ℹ️  Usando HTTP"
    if [ "$USE_PRODUCTION" = true ]; then
        CONFIG_FILE="nginx/alquileres-app.conf.http.production"
    else
        CONFIG_FILE="nginx/alquileres-app.conf.http"
    fi
fi

# Copiar configuración
cp "$CONFIG_FILE" /etc/nginx/sites-available/alquileres-app.conf

# Habilitar configuración
ln -sf /etc/nginx/sites-available/alquileres-app.conf /etc/nginx/sites-enabled/alquileres-app.conf

# Verificar y recargar
nginx -t && systemctl reload nginx
systemctl enable nginx
```

## Comandos Útiles

### Ver logs de servicios
```bash
# Backend
screen -r alquileres-backend

# Frontend (si está en Screen)
screen -r alquileres-frontend

# Frontend (si está en PM2)
pm2 logs alquileres-frontend
```

### Reiniciar servicios
```bash
# Backend
screen -S alquileres-backend -X quit
cd /var/www/alquileres-app/server
screen -dmS alquileres-backend bash -c "npm start || node dist/index.js"

# Frontend (PM2)
pm2 restart alquileres-frontend

# Frontend (Screen)
screen -S alquileres-frontend -X quit
cd /var/www/alquileres-app/web
screen -dmS alquileres-frontend bash -c "npx serve -s dist -l 4001"
```

### Detener servicios
```bash
# Backend
screen -S alquileres-backend -X quit

# Frontend (PM2)
pm2 delete alquileres-frontend

# Frontend (Screen)
screen -S alquileres-frontend -X quit
```

### Ver configuraciones de Nginx
```bash
# Ver todas las configuraciones disponibles (sites-available)
ls -la /etc/nginx/sites-available/

# Ver todas las configuraciones habilitadas (sites-enabled)
ls -la /etc/nginx/sites-enabled/

# Ver el contenido de una configuración específica
cat /etc/nginx/sites-available/alquileres-app.conf

# Ver TODA la configuración activa de Nginx (incluye todos los archivos incluidos)
nginx -T

# Ver solo la configuración de un sitio específico
cat /etc/nginx/sites-enabled/alquileres-app.conf

# Verificar sintaxis de la configuración
nginx -t

# Ver logs de Nginx
tail -f /var/log/nginx/error.log
tail -f /var/log/nginx/access.log

# Ver estado de Nginx
systemctl status nginx
```

## URLs de Acceso

- **Backend API**: `http://tu-vps-ip:4000/pentamont/lodemas/api`
- **Frontend**: `http://tu-vps-ip:4001/pentamont/lodemas/`
- **Con Nginx**: `http://tu-dominio/pentamont/lodemas/`

## Credenciales por Defecto

Después del seed:
- **Usuario**: `admin`
- **Email**: `admin@alquileres.com`
- **Contraseña**: `admin123`


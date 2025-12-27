# 🚀 Guía de Despliegue en VPS

Esta guía te ayudará a desplegar la aplicación en tu VPS.

## 📋 Requisitos Previos

- Acceso SSH al VPS
- Usuario con permisos sudo (o root)
- Git instalado en el VPS
- Conexión a internet desde el VPS

## 🎯 Opción 1: Despliegue Automático (Recomendado)

### Paso 1: Ejecutar script de despliegue

Desde tu máquina local:

```bash
# Dar permisos de ejecución
chmod +x deploy.sh

# Ejecutar despliegue (ajusta el host si es necesario)
./deploy.sh root@iCards

# O con otro usuario/host
./deploy.sh usuario@tu-vps.com
```

El script automáticamente:
- ✅ Verifica e instala Node.js 20.x
- ✅ Verifica e instala PostgreSQL
- ✅ Crea la base de datos
- ✅ Clona/actualiza el repositorio
- ✅ Instala dependencias
- ✅ Configura variables de entorno
- ✅ Ejecuta migraciones y seed
- ✅ Construye la aplicación
- ✅ Configura PM2 para producción

## 🎯 Opción 2: Despliegue Manual

### Paso 1: Conectarse al VPS

```bash
ssh root@iCards
# O tu usuario/host correspondiente
```

### Paso 2: Instalar Node.js

```bash
# Instalar Node.js 20.x
curl -fsSL https://deb.nodesource.com/setup_20.x | bash -
apt-get install -y nodejs

# Verificar instalación
node --version
npm --version
```

### Paso 3: Instalar PostgreSQL

```bash
# Instalar PostgreSQL
apt-get update
apt-get install -y postgresql postgresql-contrib

# Iniciar servicio
systemctl start postgresql
systemctl enable postgresql

# Crear base de datos
sudo -u postgres psql -c "CREATE DATABASE alquileres_db;"
```

### Paso 4: Clonar Repositorio

```bash
# Crear directorio
mkdir -p /var/www
cd /var/www

# Clonar repositorio
git clone https://github.com/EloSanz/alquileres.git alquileres-app
cd alquileres-app
```

### Paso 5: Instalar Dependencias

```bash
# Dependencias raíz
npm install

# Dependencias backend
cd server
npm install

# Dependencias frontend
cd ../web
npm install
```

### Paso 6: Configurar Variables de Entorno

```bash
# Crear archivo .env en server/
cd /var/www/alquileres-app/server
nano .env
```

Agregar:

```env
DATABASE_URL="postgresql://postgres@localhost:5432/alquileres_db?schema=public"
JWT_SECRET="tu-secret-jwt-muy-seguro-aqui"
```

**⚠️ IMPORTANTE**: Cambia `JWT_SECRET` por un valor seguro. Puedes generar uno con:
```bash
openssl rand -hex 32
```

### Paso 7: Configurar Base de Datos

```bash
cd /var/www/alquileres-app/server

# Generar cliente Prisma
npx prisma generate

# Ejecutar migraciones
npx prisma migrate deploy

# Ejecutar seed (datos iniciales)
npm run db:seed
```

### Paso 8: Construir Aplicación

```bash
# Construir backend
cd /var/www/alquileres-app/server
npm run build

# Construir frontend
cd /var/www/alquileres-app/web
npm run build
```

### Paso 9: Instalar PM2

```bash
# Instalar PM2 globalmente
npm install -g pm2

# Configurar PM2 para iniciar al arrancar
pm2 startup
# Seguir las instrucciones que aparecen
```

### Paso 10: Iniciar Aplicación con PM2

```bash
cd /var/www/alquileres-app

# Iniciar backend
cd server
pm2 start dist/index.js --name alquileres-backend --env production

# Iniciar frontend (servir archivos estáticos)
cd ../web
pm2 serve dist 5173 --name alquileres-frontend --spa

# Guardar configuración
pm2 save
```

## 🔧 Configuración de Nginx (Opcional pero Recomendado)

Para servir la aplicación con un dominio y HTTPS:

### Instalar Nginx

```bash
apt-get install -y nginx
```

### Configurar Nginx para Backend

```bash
nano /etc/nginx/sites-available/alquileres-backend
```

```nginx
server {
    listen 80;
    server_name api.tu-dominio.com;

    location / {
        proxy_pass http://localhost:3000;
        proxy_http_version 1.1;
        proxy_set_header Upgrade $http_upgrade;
        proxy_set_header Connection 'upgrade';
        proxy_set_header Host $host;
        proxy_cache_bypass $http_upgrade;
        proxy_set_header X-Real-IP $remote_addr;
        proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
    }
}
```

### Configurar Nginx para Frontend

```bash
nano /etc/nginx/sites-available/alquileres-frontend
```

```nginx
server {
    listen 80;
    server_name tu-dominio.com;

    root /var/www/alquileres-app/web/dist;
    index index.html;

    location / {
        try_files $uri $uri/ /index.html;
    }

    location /api {
        proxy_pass http://localhost:3000;
        proxy_http_version 1.1;
        proxy_set_header Upgrade $http_upgrade;
        proxy_set_header Connection 'upgrade';
        proxy_set_header Host $host;
        proxy_cache_bypass $http_upgrade;
    }
}
```

### Habilitar sitios

```bash
ln -s /etc/nginx/sites-available/alquileres-backend /etc/nginx/sites-enabled/
ln -s /etc/nginx/sites-available/alquileres-frontend /etc/nginx/sites-enabled/

# Verificar configuración
nginx -t

# Reiniciar Nginx
systemctl restart nginx
```

## 📊 Comandos Útiles de PM2

```bash
# Ver estado de servicios
pm2 status

# Ver logs
pm2 logs

# Ver logs de un servicio específico
pm2 logs alquileres-backend
pm2 logs alquileres-frontend

# Reiniciar servicios
pm2 restart all
pm2 restart alquileres-backend

# Detener servicios
pm2 stop all

# Eliminar servicios
pm2 delete all
```

## 🔄 Actualizar Aplicación

Para actualizar la aplicación después de cambios:

```bash
# Conectarse al VPS
ssh root@iCards

# Ir al directorio del proyecto
cd /var/www/alquileres-app

# Actualizar código
git pull origin main  # o master

# Reinstalar dependencias si hay cambios
npm install
cd server && npm install
cd ../web && npm install

# Reconstruir
cd server && npm run build
cd ../web && npm run build

# Reiniciar servicios
pm2 restart all
```

## 🐛 Troubleshooting

### Error: Puerto 3000 o 5173 ya en uso

```bash
# Ver qué proceso usa el puerto
lsof -i :3000
lsof -i :5173

# Matar proceso
kill -9 <PID>

# O reiniciar con PM2
pm2 restart all
```

### Error: Base de datos no conecta

```bash
# Verificar que PostgreSQL está corriendo
systemctl status postgresql

# Verificar conexión
sudo -u postgres psql -c "SELECT 1;"

# Verificar que la base de datos existe
sudo -u postgres psql -l | grep alquileres_db
```

### Error: Permisos

```bash
# Dar permisos al usuario
chown -R $USER:$USER /var/www/alquileres-app
```

## 🔐 Credenciales por Defecto

Después del seed, puedes iniciar sesión con:

- **Usuario**: `admin`
- **Email**: `admin@alquileres.com`
- **Contraseña**: `admin123`

**⚠️ IMPORTANTE**: Cambia estas credenciales en producción.

## 📝 Notas Importantes

1. **Puertos**: 
   - Backend: `3000`
   - Frontend: `5173`
   - Asegúrate de abrir estos puertos en el firewall si es necesario

2. **Variables de Entorno**: 
   - El archivo `.env` debe estar en `server/.env`
   - No lo subas al repositorio (debe estar en `.gitignore`)

3. **Base de Datos**: 
   - El seed crea datos de prueba
   - En producción, considera limpiar datos de prueba

4. **PM2**: 
   - Los servicios se reinician automáticamente si el servidor se reinicia
   - Usa `pm2 logs` para debugging


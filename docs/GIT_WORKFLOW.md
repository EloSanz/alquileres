# Git Flow - Workflow del Proyecto

Este proyecto utiliza **Git Flow** para gestionar el desarrollo de manera organizada.

## Estructura de Ramas

```
main (protected)
├── develop (protected)
│   ├── feature/branch-name
│   ├── bugfix/bug-name
│   └── hotfix/critical-fix
```

### Ramas Principales

- **`main`**: Rama de producción. Solo releases estables.
- **`develop`**: Rama de desarrollo. Contiene el código más reciente.

### Ramas de Trabajo

- **`feature/*`**: Nuevas funcionalidades
- **`bugfix/*`**: Corrección de bugs
- **`hotfix/*`**: Parches críticos para producción

## Workflow

### 1. Desarrollo de Nueva Funcionalidad

```bash
# Crear rama feature desde develop
git checkout develop
git pull origin develop
git checkout -b feature/nueva-funcionalidad

# Desarrollar y hacer commits
git add .
git commit -m "feat: descripción de la funcionalidad"

# Push de la rama
git push origin feature/nueva-funcionalidad

# Crear Pull Request hacia develop
# Revisar y mergear en GitHub
```

### 2. Merge a Develop

```bash
# Desde GitHub: Crear PR de feature/* → develop
# Aprobar PR y hacer merge
# Borrar rama feature después del merge
```

### 3. Release a Main

```bash
# Crear rama release desde develop
git checkout develop
git pull origin develop
git checkout -b release/v1.0.0

# Testing final y ajustes
git add .
git commit -m "chore: release v1.0.0"

# Merge a main y develop
git checkout main
git merge release/v1.0.0

git checkout develop
git merge release/v1.0.0

# Crear tag
git tag -a v1.0.0 -m "Release v1.0.0"
git push origin main develop --tags

# Borrar rama release
git branch -d release/v1.0.0
```

## Protección de Ramas

### Configuración en GitHub

Ir a **Settings > Branches** en el repositorio:

#### Rama `develop` (Protegida)
- ✅ Require a pull request before merging
- ✅ Require approvals (1 minimum)
- ✅ Dismiss stale pull request approvals when new commits are pushed
- ✅ Require status checks to pass before merging
- ✅ Require branches to be up to date before merging

#### Rama `main` (Protegida)
- ✅ Require a pull request before merging
- ✅ Require approvals (2 minimum)
- ✅ Require status checks to pass before merging
- ✅ Include administrators

### Status Checks Requeridas

Para que los merges sean permitidos, configurar:

1. **TypeScript compilation**: `npm run type-check`
2. **Linting**: `npm run lint` (si aplica)
3. **Tests**: `npm run test` (cuando existan)

## Configuración de GitHub Secrets

El proyecto utiliza GitHub Actions para despliegue automático. Las secrets se configuran mediante **Environments** de GitHub para mayor seguridad y organización.

### Crear Environment "penta mont"

1. Ir a **Settings > Environments** en el repositorio de GitHub
2. Click en **New environment**
3. Nombre del environment: `penta mont`
4. Click en **Configure environment**

### Configurar Secrets del Environment

En la página de configuración del environment "penta mont", agregar las siguientes secrets:

#### Secrets Requeridas

- **`SSH_HOST`**: Dirección IP o hostname del servidor VPS donde se despliega la aplicación
  - Ejemplo: `192.168.1.100` o `servidor.ejemplo.com`
  
- **`SSH_PASSWORD`**: Contraseña del usuario SSH para acceder al servidor
  - Ejemplo: `tu-contraseña-segura`

#### Cómo Agregar Secrets

1. En la página del environment "penta mont", buscar la sección **Secrets**
2. Click en **Add secret**
3. Ingresar el nombre de la secret (ej: `SSH_HOST`)
4. Ingresar el valor de la secret
5. Click en **Add secret**
6. Repetir para cada secret requerida

### Uso en Workflows

El workflow de despliegue (`.github/workflows/deploy.yml`) utiliza este environment:

```yaml
environment: penta mont
```

Las secrets configuradas en el environment "penta mont" estarán disponibles automáticamente cuando el workflow se ejecute en el contexto de ese environment.

### Verificación

Para verificar que las secrets están configuradas correctamente:

1. Hacer push a la rama `develop`
2. El workflow se ejecutará automáticamente
3. Revisar los logs del workflow en **Actions** para confirmar que las secrets se están usando correctamente

## Convenciones de Commit

Usar **Conventional Commits**:

```
feat: nueva funcionalidad
fix: corrección de bug
docs: cambios en documentación
style: cambios de estilo
refactor: refactorización
test: agregar tests
chore: cambios de build o configuración
```

### Ejemplos

```bash
git commit -m "feat: agregar endpoint de creación de tenants"
git commit -m "fix: corregir validación de email en formulario"
git commit -m "docs: actualizar README con nueva funcionalidad"
git commit -m "refactor: simplificar lógica de TenantService"
```

## Branch Naming

- `feature/nueva-funcionalidad`
- `feature/add-user-authentication`
- `bugfix/fix-login-validation`
- `hotfix/critical-security-patch`

## Pull Request Template

Crear `.github/PULL_REQUEST_TEMPLATE.md`:

```markdown
## Descripción
Breve descripción de los cambios.

## Tipo de Cambio
- [ ] Feature
- [ ] Bug fix
- [ ] Documentation
- [ ] Refactoring
- [ ] Hotfix

## Checklist
- [ ] Código compilable sin errores
- [ ] Type-checking pasa
- [ ] Tests pasan (si existen)
- [ ] Documentación actualizada
- [ ] Linting pasa

## Testing
- [ ] Tests unitarios
- [ ] Tests de integración
- [ ] Testing manual

## Notas Adicionales
Cualquier información relevante para los reviewers.
```

## Comandos Útiles

```bash
# Ver estado de ramas
git branch -a

# Ver commits sin push
git log --oneline origin/develop..HEAD

# Reset a develop si algo sale mal
git reset --hard origin/develop

# Squash commits antes de PR
git rebase -i HEAD~3

# Ver diferencias entre ramas
git diff develop..feature/branch-name
```

## Resolución de Conflictos

```bash
# Actualizar rama con develop
git checkout feature/branch-name
git fetch origin
git rebase origin/develop

# Resolver conflictos en archivos
# Hacer commit
git add .
git rebase --continue

# Si hay problemas, abortar rebase
git rebase --abort
```

## Configuración Local Recomendada

```bash
# Configurar usuario
git config --global user.name "Tu Nombre"
git config --global user.email "tu.email@ejemplo.com"

# Configurar pull strategy
git config --global pull.rebase true

# Configurar aliases útiles
git config --global alias.co checkout
git config --global alias.br branch
git config --global alias.ci commit
git config --global alias.st status
```

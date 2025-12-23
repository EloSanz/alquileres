# Configuración de Protección de Ramas

## Acceso Requerido
- Ser **Owner** del repositorio o tener permisos de **Admin**
- Acceder a Settings > Branches

## Configuración de Rama `develop`

### Paso 1: Ir a Settings
1. Abrir repositorio en GitHub
2. Ir a **Settings** tab
3. En el menú lateral: **Branches**

### Paso 2: Agregar Regla para `develop`
1. Click en **"Add rule"**
2. En **Branch name pattern**: `develop`

### Paso 3: Configurar Protecciones
Marcar las siguientes opciones:

#### ✅ Require a pull request before merging
- [x] Required
- [x] Dismiss stale pull request approvals when new commits are pushed
- [x] Require approval for the most recent push
- [x] Restrict who can dismiss pull request reviews: **Repository administrators**

#### ✅ Require status checks to pass before merging
- [x] Required
- Status checks:
  - `type-check` (backend)
  - `type-check` (frontend)
  - `lint` (opcional, si existe)
  - `test` (opcional, si existe)

#### ✅ Require branches to be up to date before merging
- [x] Required

#### ✅ Include administrators
- [x] Required (los admins también deben seguir las reglas)

## Configuración de Rama `main`

### Paso 1: Agregar Regla para `main`
1. Click en **"Add rule"**
2. En **Branch name pattern**: `main`

### Paso 2: Configurar Protecciones Más Estrictas
Marcar las siguientes opciones:

#### ✅ Require a pull request before merging
- [x] Required
- [x] Dismiss stale pull request approvals when new commits are pushed
- [x] Require approval for the most recent push
- [x] **Required approvals: 2** (mínimo)
- [x] Restrict who can dismiss pull request reviews: **Repository administrators**

#### ✅ Require status checks to pass before merging
- [x] Required
- Status checks:
  - `type-check` (backend)
  - `type-check` (frontend)
  - `build` (si existe CI/CD)
  - `test` (si existe)
  - `e2e` (si existe)

#### ✅ Require branches to be up to date before merging
- [x] Required

#### ✅ Include administrators
- [x] Required

## Configuración de GitHub Actions (Opcional pero Recomendado)

Crear `.github/workflows/ci.yml`:

```yaml
name: CI

on:
  pull_request:
    branches: [ develop, main ]

jobs:
  type-check-backend:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v3
      - uses: actions/setup-node@v3
        with:
          node-version: '18'
      - run: cd server && npm ci && npm run type-check

  type-check-frontend:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v3
      - uses: actions/setup-node@v3
        with:
          node-version: '18'
      - run: cd web && npm ci && npm run type-check
```

## Verificación de Configuración

Después de configurar, verificar:

1. ✅ Intentar hacer push directo a `develop` → Debe fallar
2. ✅ Crear PR desde rama feature → Debe requerir approval
3. ✅ Intentar merge sin approvals → Debe fallar
4. ✅ Intentar merge con status checks fallidos → Debe fallar

## Troubleshooting

### Error: "Required status check not found"
- Verificar que los status checks estén correctamente nombrados
- Asegurarse de que las Actions estén corriendo en PRs

### Error: "Branch not up to date"
- Hacer rebase de la rama feature con develop antes del PR
- `git rebase origin/develop`

### Error: "Pull request reviews are stale"
- Hacer push de nuevos commits a la rama feature
- Esto resetea los approvals y requiere nuevos reviews

## Comandos Útiles para Desarrollo

```bash
# Ver protección de ramas
gh api repos/{owner}/{repo}/branches/{branch}/protection

# Crear PR desde terminal
gh pr create --base develop --head feature/branch-name --title "feat: description"

# Ver status de PR
gh pr view {number} --json reviews,statusCheckRollup
```

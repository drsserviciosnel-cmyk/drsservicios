# Sesión: Instalación de gstack en Claude Code

- **Fecha:** 2026-08-03
- **Usuario:** mvaldes86@gmail.com
- **Sistema:** Windows 10 Pro (10.0.19045), shell PowerShell + Git Bash
- **Directorio de trabajo:** `C:\Users\Manuel Valdés\.gemini\DRSSERVICIOS`
- **Objetivo:** Instalar https://github.com/garrytan/gstack

---

## ¿Qué es gstack?

Toolkit CLI open-source (licencia MIT) para **Claude Code** que añade un "equipo de
ingeniería virtual" de 23+ agentes especializados como *skills* invocables con `/comando`
(CEO que replantea el producto, eng manager que fija arquitectura, diseñador que detecta
"AI slop", revisor que caza bugs de producción, QA lead que abre un navegador real, etc.).

**Flujo del sprint:** Think → Plan → Build → Review → Test → Ship → Reflect

**Prerrequisitos:** Claude Code · Git · Bun v1.0+ · Node.js (en Windows)

---

## Estado inicial del sistema

| Herramienta | Estado |
|-------------|--------|
| git | ✅ 2.55.0.windows.3 |
| node | ✅ v24.14.0 |
| bun  | ❌ no instalado (requerido) |

`HOME = /c/Users/Manuel Valdés`

---

## Pasos ejecutados

### 1. Instalar Bun (faltaba)

```powershell
# PowerShell (instalador oficial de Bun)
irm bun.sh/install.ps1 | iex
```

Resultado: **Bun 1.3.14** instalado en `C:\Users\Manuel Valdés\.bun\bin\bun.exe`
(el instalador lo añadió al PATH de usuario permanente).

### 2. Clonar gstack

```bash
export PATH="$HOME/.bun/bin:$PATH"
git clone --single-branch --depth 1 https://github.com/garrytan/gstack.git \
  "$HOME/.claude/skills/gstack"
```

### 3. Ejecutar setup

```bash
cd "$HOME/.claude/skills/gstack"
./setup
```

El setup instaló 294 dependencias con Bun, generó los `SKILL.md`, e intentó compilar
los binarios (`browse`, `design`, `pdf`, ...).

---

## ⚠️ Problema encontrado y solución

El paso `bun build --compile` **falló**:

```
error: failed to copy bun executable into temporary file: ENOENT
Failed to get temp file path: FileNotFound
error: script "build" exited with code 1
```

**Causa raíz:** la ruta de usuario contiene un acento (`Manuel Valdés` → la `é` es
no-ASCII). `bun --compile` no lograba crear el archivo temporal para empaquetar el
runtime de Bun. El propio `scripts/build.sh` intenta esquivar esto copiando bun a
`.tmp-bun-bin/`, pero ese directorio está **dentro** de `~/.claude/skills/gstack`,
que también cuelga de la carpeta con acento — así que el workaround no aplicaba.

**Solución aplicada:** compilar usando una copia de Bun y un directorio temporal en
rutas **solo-ASCII**:

```bash
# Directorios de trabajo solo-ASCII
mkdir -p /c/gstackbld/tmp /c/gstackbld/bin
cp -f "$HOME/.bun/bin/bun.exe" /c/gstackbld/bin/bun.exe

export TMPDIR="C:/gstackbld/tmp" TEMP="C:/gstackbld/tmp" TMP="C:/gstackbld/tmp"
export BUN_CMD="/c/gstackbld/bin/bun.exe"
# bun también en PATH (un sub-script llama a `bun` directamente):
export PATH="/c/gstackbld/bin:$HOME/.bun/bin:$PATH"

cd "$HOME/.claude/skills/gstack"
bash scripts/build.sh        # -> exit 0
```

Con esto compilaron correctamente:
`browse.exe`, `find-browse.exe`, `design.exe`, `pdf.exe`,
`gstack-global-discover.exe` y el bundle Node `server-node.mjs`.

Luego se relanzó el `./setup` completo con el mismo entorno → **exit 0**.
El setup además descargó **Chrome Headless Shell 145.0.7632.6** (Playwright) y
verificó que Node.js puede cargar Playwright.

Finalmente se eliminó el directorio temporal:

```bash
rm -rf /c/gstackbld
```

---

## ✅ Resultado final

```
gstack ready (claude).
  browse: /c/Users/Manuel Valdés/.claude/skills/gstack/browse/dist/browse
  linked root skill alias: gstack
```

- **55 skills** generadas y enlazadas (root `gstack` + 54 más).
- Bun 1.3.14 en el PATH de usuario permanente.
- Instalación en modo **file-copy** (Windows no requiere Developer Mode).

### Skills destacadas / primeros comandos

| Situación | Comando |
|-----------|---------|
| Idea nueva / repo vacío | `/office-hours` o `/spec` |
| Código existente | `/qa` (verlo funcionar) o `/investigate` |
| Revisión de código | `/review` |
| QA en navegador | `/qa` |
| Merge + deploy | `/ship` |
| Actualizar gstack | `/gstack-upgrade` |

---

## Notas / mantenimiento

- **Reiniciar Claude Code** para cargar skills y PATH de Bun en sesión limpia.
- Tras cada `git pull` de gstack → **volver a correr `./setup`** (Windows usa copias
  de archivos, no symlinks).
- El problema del acento en la ruta **solo afecta a la compilación** (`bun --compile`).
  Si en el futuro hay que recompilar (p. ej. tras un `git pull` con cambios en los
  binarios), usar el mismo truco de `TMPDIR`/`BUN_CMD` en rutas solo-ASCII.
- Opcionales no aplicados:
  - **Team Mode** (`./setup --team`) para compartir gstack en un repo con el equipo.
  - **Hooks de plan-tune** (`./setup --plan-tune-hooks`).
  - **gbrain** (`/setup-gbrain`) — bloques "brain-aware" quedaron suprimidos (0 tokens).
  - Hook anti-credenciales en push: `gstack-config set redact_prepush_hook true`.

---

## Comandos clave (resumen copy-paste)

```bash
# 1. Instalar Bun (PowerShell)
irm bun.sh/install.ps1 | iex

# 2. Clonar
git clone --single-branch --depth 1 https://github.com/garrytan/gstack.git \
  ~/.claude/skills/gstack

# 3. Compilar con rutas solo-ASCII (necesario por el acento en "Manuel Valdés")
mkdir -p /c/gstackbld/tmp /c/gstackbld/bin
cp -f ~/.bun/bin/bun.exe /c/gstackbld/bin/bun.exe
export TMPDIR="C:/gstackbld/tmp" TEMP="C:/gstackbld/tmp" TMP="C:/gstackbld/tmp"
export BUN_CMD="/c/gstackbld/bin/bun.exe"
export PATH="/c/gstackbld/bin:$HOME/.bun/bin:$PATH"
cd ~/.claude/skills/gstack && ./setup

# 4. Limpieza
rm -rf /c/gstackbld
```

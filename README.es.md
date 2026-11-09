# Cloudy Launcher

[English](README.md) · **Español**

Instala, actualiza y abre las apps de Cloudy: Cloudy Canvas, Cloudy PDF, Cloudy Clip y Cloudy
Convert. Elige una app, pulsa **Install** y el launcher la mantiene al día. También se mantiene al día
a sí mismo.

## Instalación

### Windows 10/11

No necesita permisos de administrador: se instala para tu usuario. Abre **PowerShell** y ejecuta:

```powershell
irm https://raw.githubusercontent.com/Cloudy-Studio-Apps/cloudy-launcher/master/install.ps1 | iex
```

O, en el **Símbolo del sistema** (cmd):

```bat
powershell -ExecutionPolicy Bypass -c "irm https://raw.githubusercontent.com/Cloudy-Studio-Apps/cloudy-launcher/master/install.ps1 | iex"
```

Descarga el instalador más reciente, lo ejecuta con una ventana de progreso y abre el launcher.
También puedes descargar `Cloudy Launcher_<versión>_x64-setup.exe` de la
[última versión publicada](https://github.com/Cloudy-Studio-Apps/cloudy-launcher/releases/latest) y
ejecutarlo. Windows SmartScreen puede avisar de un editor desconocido porque el instalador aún no
está firmado: elige **Más información › Ejecutar de todas formas**.

Para quitarlo, en PowerShell:

```powershell
& ([scriptblock]::Create((irm https://raw.githubusercontent.com/Cloudy-Studio-Apps/cloudy-launcher/master/install.ps1))) -Uninstall
```

### Linux

Ubuntu, Debian, Arch, CachyOS, Manjaro, Fedora, openSUSE y otras. No necesita `sudo`: se instala
para tu usuario. En una terminal:

```sh
curl -fsSL https://raw.githubusercontent.com/Cloudy-Studio-Apps/cloudy-launcher/master/install.sh | bash
```

Guarda el AppImage en `~/.local/share/cloudy-launcher/`, añade el comando `cloudy-launcher` y una
entrada en el menú de aplicaciones, y te avisa si falta FUSE 2 (que necesitan los AppImage), con el
comando para tu distribución.

Para quitarlo:

```sh
curl -fsSL https://raw.githubusercontent.com/Cloudy-Studio-Apps/cloudy-launcher/master/install.sh | bash -s -- --uninstall
```

### Arch Linux / CachyOS (paquete de pacman)

En lugar del comando anterior, puedes instalar el paquete de la
[última versión publicada](https://github.com/Cloudy-Studio-Apps/cloudy-launcher/releases/latest):

```sh
sudo pacman -U cloudy-launcher-*.pkg.tar.zst
```

Así lo gestiona pacman: el launcher te avisa cuando hay una versión nueva y abre la página de la
versión para que instales el paquete nuevo.

### Actualizaciones

Instalado con cualquiera de los comandos, o con el instalador de Windows, el launcher se actualiza
solo: cuando sale una versión nueva, un aviso ofrece **Update and restart** (actualizar y reiniciar). La cabecera muestra
la versión que tienes.

## Apps

| App            | Qué es                                                                  | Repositorio                                                            |
| -------------- | ----------------------------------------------------------------------- | ---------------------------------------------------------------------- |
| Cloudy Canvas  | Pizarras y diseños en un mismo lienzo                                   | [cloudy-canvas](https://github.com/Cloudy-Studio-Apps/cloudy-canvas)   |
| Cloudy PDF     | Un lector de PDF minimalista                                            | [cloudy-pdf](https://github.com/Cloudy-Studio-Apps/cloudy-pdf)         |
| Cloudy Clip    | Un editor de vídeo sencillo que los agentes pueden editar contigo       | [cloudy-clip](https://github.com/Cloudy-Studio-Apps/cloudy-clip)       |
| Cloudy Convert | Convierte metraje para editarlo y guarda contenido multimedia de la web | [cloudy-convert](https://github.com/Cloudy-Studio-Apps/cloudy-convert) |

## Desarrollo

Tauri 2, React 19, Vite, Tailwind v4, Zustand y el sistema de diseño de Cloudy (copiado de Cloudy
Canvas en `src/shared/ui`).

```sh
pnpm install
pnpm tauri dev
pnpm typecheck
pnpm release:linux   # AppImage
pnpm release:win     # instalador NSIS, compilado desde Linux con cargo-xwin
pnpm release:arch    # paquete de pacman, en packaging/arch/
```

El icono de cada app en el launcher se dibuja en `src/shared/ui/brand/` y se asocia por id en
`src/launcher/app-logo.tsx`.

## Versiones

`pnpm release:tag 0.2.0` escribe la versión en `package.json`, `tauri.conf.json`, `Cargo.toml` y
`Cargo.lock`, hace el commit, crea la etiqueta `v0.2.0` y lo sube. La etiqueta inicia
[`.github/workflows/release.yml`](.github/workflows/release.yml), que compila el instalador de
Windows, el AppImage y el paquete de Arch, los firma con los secretos de la organización
`TAURI_SIGNING_PRIVATE_KEY` y `TAURI_SIGNING_PRIVATE_KEY_PASSWORD`, sube `latest.json` y publica la
versión cuando todas las compilaciones terminan bien.

**Actualizaciones propias:** al arrancar y cada 6 horas, el launcher lee el `latest.json` de la
última versión (`plugins.updater` en `tauri.conf.json`, comprobado con la clave pública de Cloudy) y
muestra un aviso bajo la cabecera (`src/launcher/self-update-banner.tsx`). "Update and restart"
la instala. Un launcher que no puede reemplazarse a sí mismo muestra otra cosa: en cualquier otra copia en Linux, el comando de instalación con los botones **Copy** y **Run in terminal** (`install.sh` la cambia al AppImage); con el paquete de Arch, que gestiona pacman, la página de la versión. Cómo
está instalado lo dice `src-tauri/src/self_install.rs`. Las compilaciones de desarrollo no buscan
actualizaciones.

**Scripts de instalación:** `install.sh` (Linux) e `install.ps1` (Windows) se sirven desde `master`
a través de raw.githubusercontent.com, así que sus cambios están activos en cuanto se suben. Los dos
leen el `latest.json` de la última versión.

## Cómo funciona

- **Catálogo**: las apps están definidas en `src-tauri/src/catalog.rs` (id, repositorio de GitHub,
  nombre del binario, clave pública del actualizador). Para añadir una app, añade una entrada ahí.
- **Versiones**: el launcher lee la última versión publicada de cada repositorio a través de su
  `latest.json` (el archivo del actualizador, en `releases/latest/download/latest.json`) y elige el
  instalador de este sistema: el instalador NSIS en Windows y el AppImage en Linux. No usa la API
  de GitHub: sin iniciar sesión permite 60 peticiones por hora y dirección IP, que se agotan con
  unas pocas actualizaciones. La versión de una app tiene que venir de su flujo de publicación, que
  sube `latest.json`.
- **Firmas**: cuando una app tiene `pubkey`, la descarga debe coincidir con su firma de
  `latest.json` (la misma firma minisign que comprueba el actualizador de Tauri); si no, no se
  instala.
- **Instalación**: en Windows ejecuta el instalador NSIS en silencio (por usuario, sin
  administrador) y lee la versión instalada de su clave de desinstalación en el registro. En Linux
  guarda el AppImage en la carpeta de datos de la app (`apps/<id>/`) y lo anota en
  `installed.json`; una app de un paquete del sistema (`/usr/bin/<binario>`) se muestra y se abre,
  pero se deja al gestor de paquetes.

## Licencia

Copyright © 2026 DarkRedgm.

Cloudy Launcher es software libre, con licencia
[GNU Affero General Public License v3.0](LICENSE). Puedes usarlo, estudiarlo, modificarlo y
compartirlo. Si distribuyes una versión modificada, o la ofreces como un servicio que otros usan a
través de una red, debes publicar su código fuente con la misma licencia.

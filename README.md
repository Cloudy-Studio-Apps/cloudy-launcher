# Cloudy Launcher

**English** · [Español](README.es.md)

Installs, updates and opens the Cloudy apps: Cloudy Canvas, Cloudy PDF, Cloudy Clip and Cloudy
Convert. Pick an app, press Install, and the launcher keeps it up to date. It keeps itself up to
date too.

## Install

### Windows 10/11

No admin needed: it installs for your user. Open **PowerShell** and run:

```powershell
irm https://raw.githubusercontent.com/Cloudy-Studio-Apps/cloudy-launcher/master/install.ps1 | iex
```

Or, in **Command Prompt** (cmd):

```bat
powershell -ExecutionPolicy Bypass -c "irm https://raw.githubusercontent.com/Cloudy-Studio-Apps/cloudy-launcher/master/install.ps1 | iex"
```

It downloads the latest installer, runs it with a progress window and opens the launcher. You can
also download `Cloudy Launcher_<version>_x64-setup.exe` from the
[latest release](https://github.com/Cloudy-Studio-Apps/cloudy-launcher/releases/latest) and run it.
Windows SmartScreen may warn about an unknown publisher, because the installer isn't code-signed
yet: choose **More info › Run anyway**.

To remove it, in PowerShell:

```powershell
& ([scriptblock]::Create((irm https://raw.githubusercontent.com/Cloudy-Studio-Apps/cloudy-launcher/master/install.ps1))) -Uninstall
```

### Linux

Ubuntu, Debian, Arch, CachyOS, Manjaro, Fedora, openSUSE and others. No `sudo` needed: it installs
for your user. In a terminal:

```sh
curl -fsSL https://raw.githubusercontent.com/Cloudy-Studio-Apps/cloudy-launcher/master/install.sh | bash
```

It puts the AppImage in `~/.local/share/cloudy-launcher/`, adds a `cloudy-launcher` command and an
entry in your app menu, and tells you if FUSE 2 (which AppImages need) is missing, with the command
for your distro.

To remove it:

```sh
curl -fsSL https://raw.githubusercontent.com/Cloudy-Studio-Apps/cloudy-launcher/master/install.sh | bash -s -- --uninstall
```

### Arch Linux / CachyOS (pacman package)

Instead of the command above, you can install the package from the
[latest release](https://github.com/Cloudy-Studio-Apps/cloudy-launcher/releases/latest):

```sh
sudo pacman -U cloudy-launcher-*.pkg.tar.zst
```

pacman then owns it, so the launcher tells you when a new version is out and opens the release page
for you to install the new package.

### Updates

Installed with either command, or with the Windows installer, the launcher updates itself: when a
new version is out, a banner offers **Update and restart**. The header shows the version you have.

## Apps

| App            | What it is                                              | Repo                                                                   |
| -------------- | ------------------------------------------------------- | ---------------------------------------------------------------------- |
| Cloudy Canvas  | Boards and designs on one canvas                        | [cloudy-canvas](https://github.com/Cloudy-Studio-Apps/cloudy-canvas)   |
| Cloudy PDF     | A minimalist PDF reader                                 | [cloudy-pdf](https://github.com/Cloudy-Studio-Apps/cloudy-pdf)         |
| Cloudy Clip    | A simple video editor that agents can edit with you     | [cloudy-clip](https://github.com/Cloudy-Studio-Apps/cloudy-clip)       |
| Cloudy Convert | Convert footage for editing and save media from the web | [cloudy-convert](https://github.com/Cloudy-Studio-Apps/cloudy-convert) |

## Develop

Tauri 2, React 19, Vite, Tailwind v4, Zustand, and the Cloudy design system (copied from Cloudy
Canvas into `src/shared/ui`).

```sh
pnpm install
pnpm tauri dev
pnpm typecheck
pnpm release:linux   # AppImage
pnpm release:win     # NSIS installer, cross-built with cargo-xwin
pnpm release:arch    # pacman package, in packaging/arch/
```

Each app's icon on the launcher is drawn in `src/shared/ui/brand/` and mapped by id in
`src/launcher/app-logo.tsx`.

## Releases

`pnpm release:tag 0.2.0` writes the version into `package.json`, `tauri.conf.json`, `Cargo.toml` and
`Cargo.lock`, commits it, tags `v0.2.0` and pushes. The tag starts
[`.github/workflows/release.yml`](.github/workflows/release.yml), which builds the Windows installer,
the AppImage and the Arch package, signs them with the `TAURI_SIGNING_PRIVATE_KEY` and
`TAURI_SIGNING_PRIVATE_KEY_PASSWORD` organization secrets, uploads `latest.json`, and publishes the
release once every build passed.

**Self-updates:** at start and every 6 hours the launcher reads the latest release's `latest.json`
(`plugins.updater` in `tauri.conf.json`, checked against the Cloudy public key) and shows a banner
under the header (`src/launcher/self-update-banner.tsx`). "Update and restart" installs it. A
launcher that can't replace itself shows instead: the install command, with **Copy** and **Run in
terminal** (any other Linux copy: `install.sh` switches it to the AppImage), or the release page
(the Arch package, which pacman owns). How it's installed comes from `src-tauri/src/self_install.rs`.
Dev builds don't check.

**Install scripts:** `install.sh` (Linux) and `install.ps1` (Windows) are served from `master`
through raw.githubusercontent.com, so changes to them are live once pushed. Both read the latest
release's `latest.json`.

## How it works

- **Catalog**: the apps are hard-coded in `src-tauri/src/catalog.rs` (id, GitHub repo, binary name,
  updater public key). Add an entry there to add an app.
- **Releases**: the launcher reads each repo's latest published release through its
  `latest.json` (the updater's file, at `releases/latest/download/latest.json`) and picks the
  installer for this system: the NSIS installer on Windows, the AppImage on Linux. Not GitHub's
  API: without signing in it allows 60 requests an hour per IP address, which a few refreshes use
  up. An app's release has to come from its release workflow, which uploads `latest.json`.
- **Signatures**: when an app has a `pubkey`, the download must match its signature from
  `latest.json` (the same minisign signature Tauri's updater checks), or it isn't installed.
- **Installing**: Windows runs the NSIS installer silently (per-user, no admin) and reads the
  installed version from its uninstall key in the registry. Linux keeps the AppImage in the app
  data folder (`apps/<id>/`) and records it in `installed.json`; an app from a system package
  (`/usr/bin/<binary>`) is shown and opened but left to the package manager.

## License

Copyright © 2026 DarkRedgm.

Cloudy Launcher is free software, licensed under the
[GNU Affero General Public License v3.0](LICENSE). You may use, study, change and share it. If you
distribute a modified version, or run one as a service others use over a network, you must publish
its source under the same license.

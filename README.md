# Cloudy Launcher

Installs, updates and opens the Cloudy apps. Tauri 2, React 19, Vite, Tailwind v4, Zustand, and the
Cloudy design system (copied from Cloudy Canvas into `src/shared/ui`).

```sh
pnpm install
pnpm tauri dev
pnpm typecheck
pnpm release:linux   # AppImage
pnpm release:win     # NSIS installer, cross-built with cargo-xwin
```

## Apps

| App | What it is | Repo |
| --- | --- | --- |
| Cloudy Canvas | Boards and designs on one canvas | [cloudy-canvas](https://github.com/Cloudy-Studio-Apps/cloudy-canvas) |
| Cloudy PDF | A minimalist PDF reader | [cloudy-pdf](https://github.com/Cloudy-Studio-Apps/cloudy-pdf) |
| Cloudy Clip | A simple video editor that agents can edit with you | [cloudy-clip](https://github.com/Cloudy-Studio-Apps/cloudy-clip) |
| Cloudy Convert | Convert footage for editing and save media from the web | [cloudy-convert](https://github.com/Cloudy-Studio-Apps/cloudy-convert) |

Each app's icon on the launcher is drawn in `src/shared/ui/brand/` and mapped by id in
`src/launcher/app-logo.tsx`.

## How it works

- **Catalog**: the apps are hard-coded in `src-tauri/src/catalog.rs` (id, GitHub repo, binary name,
  updater public key). Add an entry there to add an app.
- **Releases**: the launcher reads each repo's latest published GitHub release and picks the
  installer for this system: `*-setup.exe` on Windows, `*.AppImage` on Linux.
- **Signatures**: when an app has a `pubkey`, the download must match its `.sig` from the release
  (the same minisign signature Tauri's updater checks), or it isn't installed.
- **Installing**: Windows runs the NSIS installer silently (per-user, no admin) and reads the
  installed version from its uninstall key in the registry. Linux keeps the AppImage in the app
  data folder (`apps/<id>/`) and records it in `installed.json`; an app from a system package
  (`/usr/bin/<binary>`) is shown and opened but left to the package manager.

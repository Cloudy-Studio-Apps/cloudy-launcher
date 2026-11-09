#!/usr/bin/env bash
# Installs (or updates) the Cloudy Launcher on Linux, for the current user. No sudo needed:
#
#   curl -fsSL https://raw.githubusercontent.com/Cloudy-Studio-Apps/cloudy-launcher/master/install.sh | bash
#
# Remove it with:
#
#   curl -fsSL https://raw.githubusercontent.com/Cloudy-Studio-Apps/cloudy-launcher/master/install.sh | bash -s -- --uninstall
#
# Works on Ubuntu/Debian, Arch (and CachyOS, Manjaro…), Fedora and openSUSE. It downloads the latest
# release's AppImage into ~/.local/share/cloudy-launcher/, adds a ~/.local/bin/cloudy-launcher
# command and an app menu entry. Run as that AppImage, the launcher
# updates itself from then on. The apps it installs live in its own data folder and aren't touched.
set -euo pipefail

REPO="Cloudy-Studio-Apps/cloudy-launcher"
NAME="cloudy-launcher"
DATA_HOME="${XDG_DATA_HOME:-$HOME/.local/share}"
APP_DIR="$DATA_HOME/$NAME"
APPIMAGE="$APP_DIR/$NAME.AppImage"
BIN="$HOME/.local/bin/$NAME"
DESKTOP="$DATA_HOME/applications/$NAME.desktop"
ICON="$DATA_HOME/icons/hicolor/128x128/apps/$NAME.png"

bold=$(printf '\033[1m') dim=$(printf '\033[2m') red=$(printf '\033[31m') reset=$(printf '\033[0m')
say() { printf '%s\n' "$*"; }
step() { printf '%s==>%s %s\n' "$bold" "$reset" "$*"; }
fail() { printf '%sError:%s %s\n' "$red" "$reset" "$*" >&2; exit 1; }

if [ "$(id -u)" -eq 0 ]; then
  fail "Run this without sudo: the launcher installs for your user, in your home folder."
fi

if [ "${1:-}" = "--uninstall" ]; then
  pkill -f "$APPIMAGE" 2>/dev/null || true
  rm -f "$APPIMAGE" "$BIN" "$DESKTOP" "$ICON"
  rmdir "$APP_DIR" 2>/dev/null || true
  command -v update-desktop-database >/dev/null && update-desktop-database "$DATA_HOME/applications" 2>/dev/null || true
  say "Cloudy Launcher removed. The apps it installed are still there; uninstall them from the launcher first if you want them gone."
  exit 0
fi

[ "$(uname -s)" = "Linux" ] || fail "This script is for Linux. On Windows, download the installer from https://github.com/$REPO/releases/latest"
[ "$(uname -m)" = "x86_64" ] || fail "Only x86_64 builds are published for now (this machine is $(uname -m))."
command -v curl >/dev/null || fail "curl is needed. Install it with your package manager."

# The distro family decides the FUSE package name and whether WebKit needs a workaround.
distro="other"
if [ -r /etc/os-release ]; then
  # shellcheck disable=SC1091
  ids=$(. /etc/os-release && printf '%s %s' "${ID:-}" "${ID_LIKE:-}")
  case " $ids " in
    *" arch "*) distro="arch" ;; # Arch, CachyOS, EndeavourOS, Manjaro…
    *" debian "* | *" ubuntu "*) distro="debian" ;;
    *" fedora "* | *" rhel "*) distro="fedora" ;;
    *" suse "* | *" opensuse "*) distro="suse" ;;
  esac
fi

step "Looking for the latest Cloudy Launcher"
# The release's latest.json (the updater's file), not GitHub's API: the API allows only 60
# requests an hour per IP address without signing in, while release downloads aren't limited.
release=$(curl -fsSL "https://github.com/$REPO/releases/latest/download/latest.json") \
  || fail "Couldn't find a published Cloudy Launcher release. Check your connection, or try again later."
# The AppImage's entry: the first "url" after the "linux-x86_64-appimage" key.
url=$(printf '%s\n' "$release" | awk '/"linux-x86_64-appimage"/ { found = 1 } found && /"url"/ { print; exit }' |
  sed 's/.*"url": *"\([^"]*\)".*/\1/')
version=v$(printf '%s\n' "$release" | grep -o '"version": *"[^"]*"' | head -n1 | sed 's/.*"\([^"]*\)"$/\1/')
[ -n "$url" ] || fail "The latest release has no AppImage yet."

step "Downloading Cloudy Launcher $version"
mkdir -p "$APP_DIR" "$(dirname "$BIN")" "$(dirname "$DESKTOP")" "$(dirname "$ICON")"
# Written next to it and moved over it, so a running copy keeps working until it restarts.
curl -fL --progress-bar -o "$APPIMAGE.part" "$url" || fail "The download failed."
chmod +x "$APPIMAGE.part"
mv -f "$APPIMAGE.part" "$APPIMAGE"

# Rolling distros (Arch and its family) ship a newer Mesa than the Ubuntu the AppImage is built on,
# and its bundled WebKit can then show a blank window. Its DMA-BUF renderer is the usual culprit.
env_vars=""
[ "$distro" = "arch" ] && env_vars="WEBKIT_DISABLE_DMABUF_RENDERER=1 "

# A small wrapper rather than a symlink, so the menu entry and the terminal start it the same way.
rm -f "$BIN"
printf '#!/bin/sh\nexec env %s"%s" "$@"\n' "$env_vars" "$APPIMAGE" >"$BIN"
chmod +x "$BIN"

step "Adding it to the app menu"
curl -fsSL -o "$ICON" "https://raw.githubusercontent.com/$REPO/master/src-tauri/icons/128x128.png" || true
cat >"$DESKTOP" <<EOF
[Desktop Entry]
Type=Application
Name=Cloudy Launcher
Comment=Install and update the Cloudy apps
Exec="$BIN"
Icon=$NAME
Terminal=false
Categories=Utility;
StartupWMClass=cloudy-launcher
EOF
command -v update-desktop-database >/dev/null && update-desktop-database "$DATA_HOME/applications" 2>/dev/null || true

# AppImages need FUSE 2, which newer distros (Ubuntu 22.04+, Fedora 40+) don't install by default.
# (No `grep -q`: it would stop reading early, and with pipefail ldconfig's broken pipe fails the test.)
if ! ldconfig -p 2>/dev/null | grep 'libfuse\.so\.2' >/dev/null; then
  case "$distro" in
    arch) fuse="sudo pacman -S --needed fuse2" ;;
    debian) fuse="sudo apt install libfuse2t64   ${dim}(libfuse2 on Ubuntu 22.04 / Debian 12 and older)${reset}" ;;
    fedora) fuse="sudo dnf install fuse-libs" ;;
    suse) fuse="sudo zypper install libfuse2" ;;
    *) fuse="Install FUSE 2 (libfuse2) with your package manager." ;;
  esac
  say ""
  say "${bold}One more thing:${reset} AppImages need FUSE 2, which this system doesn't have yet:"
  say "  $fuse"
fi

say ""
say "${bold}Cloudy Launcher $version is installed.${reset} Open it from the app menu, or run: $NAME"
case ":$PATH:" in
  *":$HOME/.local/bin:"*) ;;
  *) say "${dim}(~/.local/bin isn't on your PATH, so use the app menu or $APPIMAGE)${reset}" ;;
esac
say "${dim}It updates itself from now on.${reset}"

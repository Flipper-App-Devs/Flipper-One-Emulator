# Standalone browser port: implementation notes

## Goal

Run the official Flipper One Slint UI in the existing GitHub Pages shell, with the existing device artwork and all 13 controls. The browser build must work without a running flipctl daemon or Linux system services. Device/system values should be explicitly simulated, not presented as live readings.

## Upstream source

The reference UI is `flipperdevices/flipctl-slint`, branch `dev`:

- UI entry point: `crates/flipper-ui/ui/screens.slint`
- Root component and screen model: `crates/flipper-ui/ui/root.slint`
- UI theme tokens: `crates/flipper-ui/tokens.toml` and `crates/flipper-ui/build.rs`
- Existing Rust renderer adapter: `crates/flipper-ui/src/slint_render.rs`

The official UI is a multi-file Slint component tree (idle, list, details, Ethernet, Wi-Fi, boot, keyboard, switcher, modal, and app cards). Copying only `root.slint` is insufficient because it imports the other components and generated theme. The root also has a large input model: rendering it alone is not the same as implementing navigation.

## Important distinction: upstream remote mode

The upstream `remote` feature is not a standalone browser emulator. It streams frames from a running Rust process and sends input back over HTTP. That requires a live service, so it cannot be used for this GitHub Pages-only goal.

## Browser architecture

1. Build a dedicated WASM entry crate that depends on Slint's supported web backend, rather than trying to compile the entire `flipctl` application. The existing `flipper-ui` crate's normal Slint setup uses a custom software-renderer platform; its build dependencies do not currently define a browser/WASM entry point.
2. Bring across the complete upstream Slint UI dependency tree and the exact theme/font assets required by it, retaining upstream attribution and license notices.
3. Expose a narrow browser adapter for mounting the Slint window and translating `flipper-input` events into the same UI actions the official Rust application uses.
4. Add a deterministic in-browser demo model for status and navigation. Mark system values as simulated; do not request a server or device connection.
5. Keep `index.html`'s device shell and the 13 existing hit zones. The page should report success only when the WASM module initializes and the UI mounts.
6. Add a CI build that compiles the WASM target and publishes the generated static assets to GitHub Pages only after a successful build.

## Acceptance checks

- All 13 controls remain available by pointer/touch and keyboard.
- UI canvas fits the existing screen opening and stays pixel-crisp.
- Browser console has no missing-bundle errors.
- Static hosting works from the repository's GitHub Pages subpath.
- No backend, live stream endpoint, or Linux service is required.
- The page never labels simulated values as real device telemetry.

## Current status

This branch is a porting work branch, not a finished emulator. The host page currently references `flipper-one-ui.css` and `flipper-one-ui.js`, but those artifacts are not present yet. Do not merge or deploy this branch as a completed emulator until the WASM build and browser interaction checks pass.

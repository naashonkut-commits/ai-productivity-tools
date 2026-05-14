# TODO checklist

## Done

- [x] Created full VS Code extension under `vscode-extension/` with:
  - Extension manifest (`package.json`) with publisher, icon, commands, keybindings, menus
  - TypeScript source code: explain code, commit message generator, Bwat web panel
  - TypeScript config, .vscodeignore, debug launch config
  - README, CHANGELOG, LICENSE for GitHub Marketplace listing
- [x] Generated a 128x128 PNG icon (`vscode-extension/logo.png` and `public/logo.png`)
- [x] Created GitHub Actions workflow (`.github/workflows/release.yml`) to:
  - Compile, lint, and package on every push/PR to main
  - Create a GitHub Release with .vsix artifact when a `v*` tag is pushed
  - (Optional, commented) Publish to VS Code Marketplace with `VSCE_PAT` secret
- [x] Verified extension compiles cleanly (zero TypeScript errors)
- [x] Verified extension packages into a valid .vsix (22 KB, 23 files)

## To Do (user setup)

- [ ] Create a VS Code Marketplace publisher account at https://marketplace.visualstudio.com/manage
- [ ] Set the `publisher` field in `vscode-extension/package.json` to your publisher name (currently `naashonkut-commits`)
- [ ] (Optional) Uncomment the `publish` job in `.github/workflows/release.yml` and add a `VSCE_PAT` secret to the repo
- [ ] Tag a release: `git tag v0.1.0 && git push origin v0.1.0` — the workflow will build and create a GitHub Release
- [ ] For GitHub Marketplace listing, visit https://github.com/marketplace/new and link to this repository

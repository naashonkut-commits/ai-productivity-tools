# AI Productivity Tools

**10 AI-powered developer tools for VS Code.** Explain code, generate commits, review code, find unused imports, blame lines, summarize files, refactor symbols, track your session, and access Bwat AI — all without leaving your editor.

Built by **Casa Management Solutions** — Ugandan software developers building the future of AI-assisted development.

![Logo](public/logo.png)

## Features

| # | Command | Shortcut | What It Does |
|---|---------|----------|-------------|
| 1 | **Explain Code** | `Ctrl+Shift+E` | Outputs structure, language, functions, classes, imports of selected code or entire file |
| 2 | **Generate Commit Message** | `Ctrl+Shift+G` | Analyzes git diff, suggests conventional commits with emojis, safe staging choice |
| 3 | **Open Bwat Web** | `Ctrl+Shift+W` | Full AI panel with all command buttons that actually work |
| 4 | **Summarize File** | `Ctrl+Shift+I` | LOC breakdown: code vs comments vs empty, functions, classes, health indicators |
| 5 | **Find Unused Imports** | `Ctrl+Shift+U` | Scans for dead imports, offers one-click removal with undo |
| 6 | **Code Review** | `Ctrl+Shift+R` | Static analysis: console.logs, TODO/FIXME, deep nesting, long lines, empty catches |
| 7 | **Git Blame & History** | `Ctrl+Shift+H` | Line-by-line blame with author stats, percentage, and recent commits |
| 8 | **Quick Refactor** | `Ctrl+Shift+D` | Shows reference count for symbol under cursor, triggers VS Code smart rename |
| 9 | **Browse Bwat Docs** | — | Built-in documentation panel (no internet needed) |
| 10 | **Toggle Dashboard** | `Ctrl+Shift+P` | Live session timer + active file info in the status bar |

## Requirements

- **VS Code** 1.85.0 or higher
- **Git** (for Commit Message and Git Blame features)

## Quick Start

1. Install the extension from the VS Code Marketplace
2. Open a file with code
3. Select some code and press `Ctrl+Shift+E` to explain it
4. Or open the Bwat panel with `Ctrl+Shift+W` for all commands

## All Shortcuts

| Keys (Windows/Linux) | Keys (Mac) | Command |
|---------------------|------------|---------|
| `Ctrl+Shift+E` | `Cmd+Shift+E` | Explain Code |
| `Ctrl+Shift+G` | `Cmd+Shift+G` | Commit Message |
| `Ctrl+Shift+W` | `Cmd+Shift+W` | Open Bwat Web |
| `Ctrl+Shift+I` | `Cmd+Shift+I` | Summarize File |
| `Ctrl+Shift+U` | `Cmd+Shift+U` | Unused Imports |
| `Ctrl+Shift+R` | `Cmd+Shift+R` | Code Review |
| `Ctrl+Shift+H` | `Cmd+Shift+H` | Git Blame |
| `Ctrl+Shift+D` | `Cmd+Shift+D` | Quick Refactor |
| `Ctrl+Shift+P` | `Cmd+Shift+P` | Toggle Dashboard |

You can also right-click in the editor for **Explain Code**, **Code Review**, and **Git Blame** context menu items.

## Known Issues

- Unused import detection works best for TypeScript, JavaScript, Python, Java, and PHP. Other languages fall back to a generic regex.
- Git Blame requires an active git repository with commit history.
- The Dashboard shows session time since VS Code started.

## Release Notes

### 0.2.0

Major update — 10 commands, professional branding, zero button bugs:

- 7 new commands: Summarize File, Unused Imports, Code Review, Git Blame, Quick Refactor, Browse Docs, Dashboard
- Professional hexagonal brand icon (128/256/512px)
- Fixed: Bwat Panel "Explain Code" button now works (webview message handler)
- Fixed: Commit message empty-diff edge case with fallback dialog
- Fixed: Safer staging — prompts before `git add -A`
- Fixed: All webview buttons guarded against missing `acquireVsCodeApi`
- Fixed: Output channels replace fragile webviews for explain, blame, etc.
- Status bar with session timer and active file stats

### 0.1.0

Initial release:
- Explain Code, Generate Commit Message, Open Bwat Web
- Keyboard shortcuts and context menus

---

## About Casa Management Solutions

We are a Ugandan software development firm building developer tools and AI solutions. Visit [Bwat Web](https://bwat-site.vercel.app) to learn more.

## License

MIT

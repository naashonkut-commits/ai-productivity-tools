# Change Log

All notable changes to the "AI Productivity Tools" extension.

## [0.2.0] - 2026-05-14

### Added
- **7 new commands**:
  - **Summarize File** — LOC breakdown (code/comments/empty), functions, classes, imports, file size, health indicators
  - **Find Unused Imports** — Scans for dead imports across TS/JS/Python/Java/PHP, one-click removal
  - **Code Review** — Static analysis: console.logs, debugger, TODO/FIXME tags, deep nesting, long lines, empty catch blocks
  - **Git Blame & History** — Line-by-line blame with author stats, percentage, and recent commits
  - **Quick Refactor** — Shows reference count, triggers VS Code smart rename
  - **Browse Bwat Docs** — Built-in documentation webview
  - **Toggle Dashboard** — Live session timer and active file info in status bar
- Professional multi-resolution hexagonal brand icon (128px, 256px, 512px)
- Status bar item with "Bwat AI" branding
- Progress notifications for long-running commands
- Webview message router for panel-to-extension communication

### Changed
- **Explain Code** — Now uses a dedicated output channel instead of a webview; supports whole-file analysis with function/class/import counts
- **Generate Commit Message** — Quick pick with commit/edit/regenerate/preview options; emoji-prefixed alternatives; prompts before auto-staging; handles empty-diff with helpful fallback
- **Open Bwat Web** — Redesigned panel with working buttons, command grid, and badge-styled shortcuts; graceful fallback if run outside VS Code
- All webviews hardened against missing `acquireVsCodeApi`

### Fixed
- Bwat Panel "Explain Selected Code" button now dispatches correctly via `_handleWebviewMessage`
- Commit message: trailing-empty-string edge case eliminated
- Commit message: `git add -A` no longer runs without user confirmation
- All user-facing strings are non-empty and grammatically valid
- `!editorTextFocus` removed from commit keybinding for better discoverability

## [0.1.0] - 2026-05-14

### Added
- Explain Code — webview breakdown of selected code
- Generate Commit Message — conventional commit suggestions from git diff
- Open Bwat Web — quick access to Bwat AI
- Keyboard shortcuts and context menu integration
- First-run activation notification

import * as vscode from 'vscode';

/**
 * BwatDocsCommand - Opens a webview with built-in documentation for the extension.
 */
export class BwatDocsCommand {
  public static async execute(context: vscode.ExtensionContext): Promise<void> {
    const panel = vscode.window.createWebviewPanel(
      'bwatDocs',
      'AI Productivity Tools — Docs',
      vscode.ViewColumn.One,
      { enableScripts: false }
    );

    panel.webview.html = BwatDocsCommand.getHtml();
  }

  private static getHtml(): string {
    return `<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>Bwat Docs</title>
  <style>
    body {
      font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif;
      padding: 32px;
      color: var(--vscode-editor-foreground);
      background: var(--vscode-editor-background);
      max-width: 720px;
      margin: 0 auto;
      line-height: 1.7;
    }
    h1 { font-size: 1.8em; margin-bottom: 4px; }
    h2 { font-size: 1.3em; margin-top: 28px; margin-bottom: 8px; border-bottom: 1px solid var(--vscode-panel-border); padding-bottom: 4px; }
    h3 { font-size: 1.1em; margin-top: 20px; margin-bottom: 4px; }
    p { margin-bottom: 12px; }
    kbd {
      display: inline-block;
      background: var(--vscode-badge-background);
      color: var(--vscode-badge-foreground);
      padding: 2px 8px;
      border-radius: 4px;
      font-size: 12px;
      font-family: inherit;
    }
    table { width: 100%; border-collapse: collapse; margin: 12px 0; }
    th, td { text-align: left; padding: 8px 12px; border-bottom: 1px solid var(--vscode-panel-border); }
    th { font-weight: 600; }
    code {
      background: var(--vscode-textBlockQuote-background);
      padding: 2px 6px;
      border-radius: 3px;
      font-size: 0.9em;
    }
    .shortcut-row { display: flex; justify-content: space-between; padding: 6px 0; border-bottom: 1px solid var(--vscode-panel-border); }
    .badge {
      display: inline-block;
      background: var(--vscode-badge-background);
      color: var(--vscode-badge-foreground);
      padding: 2px 10px;
      border-radius: 10px;
      font-size: 0.85em;
    }
  </style>
</head>
<body>
  <h1>AI Productivity Tools</h1>
  <p>Version <span class="badge">0.2.0</span> &middot; Built by <strong>Casa Management Solutions</strong></p>

  <h2>Commands</h2>
  <table>
    <tr><th>Command</th><th>Shortcut</th><th>Description</th></tr>
    <tr><td>Explain Code</td><td><kbd>Ctrl+Shift+E</kbd></td><td>Shows code structure, language stats, function count in an output panel</td></tr>
    <tr><td>Generate Commit Message</td><td><kbd>Ctrl+Shift+G</kbd></td><td>Analyzes git diff and suggests a conventional commit message with emoji support</td></tr>
    <tr><td>Open Bwat Web</td><td><kbd>Ctrl+Shift+W</kbd></td><td>Opens the Bwat AI webview panel with command shortcuts</td></tr>
    <tr><td>Summarize File</td><td><kbd>Ctrl+Shift+I</kbd></td><td>Shows LOC, functions, classes, imports, file size, health indicators</td></tr>
    <tr><td>Find Unused Imports</td><td><kbd>Ctrl+Shift+U</kbd></td><td>Scans for imports not referenced in the file body, offers to remove them</td></tr>
    <tr><td>Code Review</td><td><kbd>Ctrl+Shift+R</kbd></td><td>Static analysis: console.logs, TODOs, deep nesting, long lines, empty catches</td></tr>
    <tr><td>Git Blame &amp; History</td><td><kbd>Ctrl+Shift+H</kbd></td><td>Line-by-line blame with author stats and recent commit log</td></tr>
    <tr><td>Quick Refactor</td><td><kbd>Ctrl+Shift+D</kbd></td><td>Shows reference count for the symbol under cursor, triggers VS Code rename</td></tr>
    <tr><td>Browse Bwat Docs</td><td>—</td><td>Opens this documentation panel</td></tr>
    <tr><td>Toggle Dashboard</td><td><kbd>Ctrl+Shift+P</kbd></td><td>Toggles live session stats in the status bar</td></tr>
  </table>

  <h2>Explain Code</h2>
  <p>Select code in the editor and run <strong>AI: Explain Selected Code</strong>. If nothing is selected, the entire active file is analyzed. Output goes to a dedicated output channel with:</p>
  <ul>
    <li>Language, file path, and line count</li>
    <li>Detected functions/methods, classes, and import statements</li>
    <li>The full code for reference</li>
  </ul>

  <h2>Generate Commit Message</h2>
  <p>Reads your staged changes (or unstaged if nothing is staged) and suggests a commit message based on the branch name convention. Supports:</p>
  <ul>
    <li>Conventional commits: <code>feat:</code>, <code>fix:</code>, <code>docs:</code>, <code>refactor:</code>, etc.</li>
    <li>Emoji-prefixed alternatives (✨, 🐛, 📝, ♻️, etc.)</li>
    <li>Quick pick with commit, edit, regenerate, and preview options</li>
    <li>Safe staging: asks before <code>git add -A</code></li>
  </ul>

  <h2>Open Bwat Web</h2>
  <p>Opens a webview panel with buttons for all major commands. The panel communicates with the extension via <code>postMessage</code> — every button works reliably inside VS Code.</p>

  <h2>Git Blame &amp; History</h2>
  <p>If nothing is selected, blames the entire active file. If lines are selected, only those lines are analyzed. Shows:</p>
  <ul>
    <li>Per-line: commit date, author, line number, content</li>
    <li>Author stats: lines contributed and percentage</li>
    <li>Last 5 commits touching the file</li>
  </ul>

  <h2>Tips</h2>
  <ul>
    <li>Use <strong>branch names</strong> like <code>feat/new-button</code> or <code>fix/login-bug</code> for better commit message suggestions.</li>
    <li>The Dashboard shows session time and file stats in the status bar.</li>
    <li>All output channels can be cleared via the output panel toolbar.</li>
  </ul>

  <p style="margin-top: 40px; font-size: 12px; color: var(--vscode-descriptionForeground);">
    AI Productivity Tools &middot; MIT License &middot; <a href="https://github.com/naashonkut-commits/ai-productivity-tools">GitHub</a>
  </p>
</body>
</html>`;
  }
}

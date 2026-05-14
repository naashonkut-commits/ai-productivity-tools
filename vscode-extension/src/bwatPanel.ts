import * as vscode from 'vscode';

/**
 * BwatPanelCommand - Opens a webview panel to access Bwat Web's AI assistant
 * with proper message handling for embedded buttons.
 */
export class BwatPanelCommand {
  public static readonly panelType = 'aiBwatWeb';
  private static currentPanel: vscode.WebviewPanel | undefined;

  public static async execute(): Promise<void> {
    // If panel already exists, reveal it
    if (BwatPanelCommand.currentPanel) {
      BwatPanelCommand.currentPanel.reveal(vscode.ViewColumn.Beside);
      return;
    }

    const panel = vscode.window.createWebviewPanel(
      BwatPanelCommand.panelType,
      'Bwat AI',
      vscode.ViewColumn.Beside,
      {
        enableScripts: true,
        retainContextWhenHidden: true,
        localResourceRoots: [],
      }
    );

    panel.webview.html = BwatPanelCommand.getWebviewHtml();

    // Handle messages from the webview
    panel.webview.onDidReceiveMessage(
      (message: any) => {
        if (!message || !message.command) return;
        // Route to the global message handler registered in extension.ts
        vscode.commands.executeCommand(
          'aiProductivity._handleWebviewMessage',
          message
        );
      },
      undefined,
      []
    );

    // Cleanup when panel is closed
    panel.onDidDispose(() => {
      BwatPanelCommand.currentPanel = undefined;
    });

    BwatPanelCommand.currentPanel = panel;
  }

  private static getWebviewHtml(): string {
    return `<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>Bwat AI</title>
  <style>
    * { margin: 0; padding: 0; box-sizing: border-box; }
    body {
      font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Oxygen, Ubuntu, sans-serif;
      padding: 24px;
      color: var(--vscode-editor-foreground);
      background: var(--vscode-editor-background);
    }
    .container { max-width: 600px; margin: 0 auto; text-align: center; }
    .logo {
      font-size: 48px;
      font-weight: 800;
      background: linear-gradient(135deg, #6366f1, #a855f7, #ec4899);
      -webkit-background-clip: text;
      -webkit-text-fill-color: transparent;
      background-clip: text;
      margin-bottom: 8px;
      letter-spacing: -2px;
    }
    .subtitle { font-size: 28px; font-weight: 700; margin-bottom: 4px; }
    h1 { font-size: 22px; margin-bottom: 8px; }
    p { font-size: 14px; color: var(--vscode-descriptionForeground); margin-bottom: 24px; line-height: 1.6; }
    .button-group { display: flex; flex-direction: column; gap: 10px; }
    .btn {
      display: inline-flex;
      align-items: center;
      justify-content: center;
      gap: 8px;
      padding: 12px 24px;
      border-radius: 8px;
      font-size: 14px;
      font-weight: 600;
      text-decoration: none;
      cursor: pointer;
      border: none;
      transition: all 0.15s ease;
      width: 100%;
      text-align: center;
    }
    .btn-primary {
      background: linear-gradient(135deg, #6366f1, #a855f7);
      color: #fff;
    }
    .btn-primary:hover { opacity: 0.9; transform: translateY(-1px); }
    .btn-secondary {
      background: var(--vscode-button-secondaryBackground);
      color: var(--vscode-button-secondaryForeground);
    }
    .btn-secondary:hover { opacity: 0.9; }
    .btn-outline {
      background: transparent;
      color: var(--vscode-editor-foreground);
      border: 1px solid var(--vscode-panel-border);
    }
    .btn-outline:hover { background: var(--vscode-list-hoverBackground); }
    .features {
      margin-top: 28px;
      display: grid;
      grid-template-columns: 1fr 1fr;
      gap: 10px;
      text-align: left;
    }
    .feature {
      background: var(--vscode-textBlockQuote-background);
      border: 1px solid var(--vscode-textBlockQuote-border);
      border-radius: 8px;
      padding: 14px;
    }
    .feature h3 { font-size: 13px; margin-bottom: 4px; }
    .feature p { font-size: 12px; margin-bottom: 0; }
    .shortcuts {
      margin-top: 20px;
      font-size: 12px;
      color: var(--vscode-descriptionForeground);
    }
    kbd {
      display: inline-block;
      background: var(--vscode-badge-background);
      color: var(--vscode-badge-foreground);
      padding: 2px 8px;
      border-radius: 4px;
      font-size: 11px;
      font-family: inherit;
    }
    .shortcut-grid {
      margin-top: 16px;
      display: grid;
      grid-template-columns: auto 1fr;
      gap: 4px 12px;
      font-size: 12px;
      text-align: left;
    }
    .shortcut-grid kbd { text-align: center; }
  </style>
</head>
<body>
  <div class="container">
    <div class="logo">Bwat</div>
    <div class="subtitle">AI Productivity Tools</div>
    <p>
      Built by <strong>Casa Management Solutions</strong> — Uganda's AI development team.
      Powered by the Casa Neural Engine.
    </p>

    <div class="button-group">
      <a href="https://bwat-site.vercel.app" target="_blank" rel="noopener" class="btn btn-primary">
        $(link-external) Open Bwat Web
      </a>
      <button class="btn btn-secondary" id="btnExplainCode">
        $(eye) Explain Selected Code
      </button>
      <button class="btn btn-secondary" id="btnCommitMessage">
        $(git-commit) Generate Commit Message
      </button>
      <button class="btn btn-secondary" id="btnSummarizeFile">
        $(list-tree) Summarize Current File
      </button>
      <button class="btn btn-outline" id="btnDocs">
        $(book) Browse AI Docs
      </button>
    </div>

    <div class="features">
      <div class="feature">
        <h3>Explain Code</h3>
        <p><kbd>Ctrl+Shift+E</kbd> — Structure & stats</p>
      </div>
      <div class="feature">
        <h3>Commit Messages</h3>
        <p><kbd>Ctrl+Shift+G</kbd> — Smart suggestions</p>
      </div>
      <div class="feature">
        <h3>Summarize File</h3>
        <p><kbd>Ctrl+Shift+I</kbd> — LOC, functions, imports</p>
      </div>
      <div class="feature">
        <h3>Code Review</h3>
        <p><kbd>Ctrl+Shift+R</kbd> — Static analysis</p>
      </div>
      <div class="feature">
        <h3>Unused Imports</h3>
        <p><kbd>Ctrl+Shift+U</kbd> — Dead code scan</p>
      </div>
      <div class="feature">
        <h3>Git Blame</h3>
        <p><kbd>Ctrl+Shift+H</kbd> — Line history</p>
      </div>
      <div class="feature">
        <h3>Quick Refactor</h3>
        <p><kbd>Ctrl+Shift+D</kbd> — Smart rename</p>
      </div>
      <div class="feature">
        <h3>Dashboard</h3>
        <p><kbd>Ctrl+Shift+P</kbd> — Live stats</p>
      </div>
    </div>

    <div class="shortcuts">
      <strong>All shortcuts</strong>
      <div class="shortcut-grid">
        <kbd>E</kbd><span>Explain code</span>
        <kbd>G</kbd><span>Commit message</span>
        <kbd>I</kbd><span>Summarize file</span>
        <kbd>U</kbd><span>Unused imports</span>
        <kbd>R</kbd><span>Code review</span>
        <kbd>H</kbd><span>Git blame</span>
        <kbd>D</kbd><span>Quick refactor</span>
        <kbd>W</kbd><span>Open Bwat Web</span>
        <kbd>P</kbd><span>Dashboard</span>
      </div>
    </div>
  </div>

  <script>
    (function() {
      var api;
      try {
        api = acquireVsCodeApi();
      } catch(e) {
        // Not running inside VS Code webview — disable buttons gracefully
        var btns = document.querySelectorAll('button');
        for (var i = 0; i < btns.length; i++) {
          btns[i].disabled = true;
          btns[i].title = 'Only available inside VS Code';
        }
        return;
      }

      function postMsg(cmd) {
        api.postMessage({ command: cmd });
      }

      document.getElementById('btnExplainCode').addEventListener('click', function() {
        postMsg('explainCode');
      });
      document.getElementById('btnCommitMessage').addEventListener('click', function() {
        postMsg('generateCommitMessage');
      });
      document.getElementById('btnSummarizeFile').addEventListener('click', function() {
        postMsg('summarizeFile');
      });
      document.getElementById('btnDocs').addEventListener('click', function() {
        postMsg('browseBwatDocs');
      });
    })();
  </script>
</body>
</html>`;
  }
}

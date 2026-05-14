import * as vscode from 'vscode';

/**
 * DashboardCommand - Shows live session stats in the status bar.
 * Tracks session duration, file operations, and command usage.
 */
export class DashboardCommand {
  private static statusItem: vscode.StatusBarItem | undefined;
  private static sessionStart = Date.now();
  private static timer: NodeJS.Timeout | undefined;
  private static enabled = false;

  public static start(context: vscode.ExtensionContext): void {
    if (DashboardCommand.statusItem) return;

    DashboardCommand.statusItem = vscode.window.createStatusBarItem(
      vscode.StatusBarAlignment.Left, 50
    );
    DashboardCommand.statusItem.command = 'aiProductivity.toggleDashboard';
    DashboardCommand.statusItem.tooltip = 'AI Productivity Dashboard — Click to toggle';
    context.subscriptions.push(DashboardCommand.statusItem);

    // Start ticker
    DashboardCommand.enabled = true;
    DashboardCommand.updateDisplay();
    DashboardCommand.timer = setInterval(() => DashboardCommand.updateDisplay(), 5000);
  }

  public static toggle(): void {
    DashboardCommand.enabled = !DashboardCommand.enabled;
    if (DashboardCommand.enabled) {
      DashboardCommand.updateDisplay();
    } else {
      if (DashboardCommand.statusItem) {
        DashboardCommand.statusItem.hide();
      }
    }
  }

  public static dispose(): void {
    if (DashboardCommand.timer) {
      clearInterval(DashboardCommand.timer);
      DashboardCommand.timer = undefined;
    }
    DashboardCommand.statusItem?.dispose();
    DashboardCommand.statusItem = undefined;
  }

  private static updateDisplay(): void {
    if (!DashboardCommand.statusItem || !DashboardCommand.enabled) return;

    const editor = vscode.window.activeTextEditor;
    const sessionSec = Math.floor((Date.now() - DashboardCommand.sessionStart) / 1000);
    const sessionMin = Math.floor(sessionSec / 60);
    const sessionStr = sessionMin > 0
      ? `${sessionMin}m ${sessionSec % 60}s`
      : `${sessionSec}s`;

    let parts = [`$(watch) ${sessionStr}`];

    if (editor) {
      const doc = editor.document;
      parts.push(`$(file-text) ${doc.fileName.split('/').pop() || ''}`);
      parts.push(`$(symbol-number) ${doc.lineCount}L`);

      const sel = editor.selection;
      if (!sel.isEmpty) {
        parts.push(`$(selection) ${Math.abs(sel.end.line - sel.start.line) + 1}L`);
      }
    }

    DashboardCommand.statusItem.text = parts.join('  ');
    DashboardCommand.statusItem.show();
  }
}

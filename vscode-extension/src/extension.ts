import * as vscode from 'vscode';
import { ExplainCommand } from './explain';
import { CommitMessageCommand } from './commitMessage';
import { BwatPanelCommand } from './bwatPanel';
import { SummarizeFileCommand } from './summarizeFile';
import { UnusedImportsCommand } from './unusedImports';
import { CodeReviewCommand } from './codeReview';
import { GitBlameCommand } from './gitBlame';
import { QuickRefactorCommand } from './quickRefactor';
import { BwatDocsCommand } from './bwatDocs';
import { DashboardCommand } from './dashboard';

export function activate(context: vscode.ExtensionContext) {
  console.log('[AI Productivity Tools] Activating...');

  // ── Status bar item ─────────────────────────────────────────
  const statusBar = vscode.window.createStatusBarItem(
    vscode.StatusBarAlignment.Right, 100
  );
  statusBar.text = '$(rocket) Bwat AI';
  statusBar.tooltip = 'AI Productivity Tools — Click to open Bwat Web';
  statusBar.command = 'aiProductivity.openBwatWeb';
  statusBar.show();
  context.subscriptions.push(statusBar);

  // ── Progress indicator helper ───────────────────────────────
  function withProgress<T>(
    title: string,
    task: (progress: vscode.Progress<{ message?: string }>, token: vscode.CancellationToken) => Thenable<T>
  ): Thenable<T> {
    return vscode.window.withProgress(
      { location: vscode.ProgressLocation.Notification, title },
      task
    );
  }

  // ── Command wrappers ────────────────────────────────────────
  const commands: [string, (...args: any[]) => any, string?][] = [
    ['aiProductivity.explainCode', () => ExplainCommand.execute(), 'Explaining code...'],
    ['aiProductivity.generateCommitMessage', () => CommitMessageCommand.execute(), 'Generating commit message...'],
    ['aiProductivity.openBwatWeb', () => BwatPanelCommand.execute()],
    ['aiProductivity.summarizeFile', () => SummarizeFileCommand.execute()],
    ['aiProductivity.findUnusedImports', () => UnusedImportsCommand.execute()],
    ['aiProductivity.codeReview', () => CodeReviewCommand.execute()],
    ['aiProductivity.gitBlame', () => GitBlameCommand.execute()],
    ['aiProductivity.quickRefactor', () => QuickRefactorCommand.execute()],
    ['aiProductivity.browseBwatDocs', () => BwatDocsCommand.execute(context)],
    ['aiProductivity.toggleDashboard', () => DashboardCommand.toggle()],
  ];

  for (const [id, fn, progressTitle] of commands) {
    const disposable = vscode.commands.registerCommand(id, () => {
      if (progressTitle) {
        return withProgress(progressTitle, () => Promise.resolve(fn()));
      }
      return fn();
    });
    context.subscriptions.push(disposable);
  }

  // ── Webview message router ──────────────────────────────────
  // Routes messages from Bwat webview panels to the right handler
  context.subscriptions.push(
    vscode.commands.registerCommand(
      'aiProductivity._handleWebviewMessage',
      (message: any) => {
        if (!message || !message.command) return;
        switch (message.command) {
          case 'explainCode':
            return ExplainCommand.execute();
          case 'generateCommitMessage':
            return CommitMessageCommand.execute();
          default:
            break;
        }
      }
    )
  );

  // ── Dashboard start ─────────────────────────────────────────
  DashboardCommand.start(context);

  // ── First-run notification ──────────────────────────────────
  if (!context.globalState.get('activated')) {
    context.globalState.update('activated', true);
    vscode.window.showInformationMessage(
      'AI Productivity Tools is ready! 10 AI-powered commands loaded.',
      'Open Bwat Web', 'Explain Code'
    ).then((selection) => {
      if (selection === 'Open Bwat Web') {
        BwatPanelCommand.execute();
      } else if (selection === 'Explain Code') {
        ExplainCommand.execute();
      }
    });
  }

  console.log('[AI Productivity Tools] Activated — 10 commands registered.');
}

export function deactivate() {
  DashboardCommand.dispose();
  console.log('[AI Productivity Tools] Deactivated.');
}

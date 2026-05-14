import * as vscode from 'vscode';
import * as cp from 'child_process';

const outputChannel = vscode.window.createOutputChannel('AI: Git Blame');

export class GitBlameCommand {
  public static async execute(): Promise<void> {
    const editor = vscode.window.activeTextEditor;
    if (!editor) {
      vscode.window.showWarningMessage('No active editor. Open a file first.');
      return;
    }

    const rootPath = GitBlameCommand.getWorkspaceRoot();
    if (!rootPath) return;

    const doc = editor.document;
    const selection = editor.selection;
    const filePath = doc.uri.fsPath;
    const fileName = doc.fileName.split('/').pop() || doc.fileName;

    // Determine line range
    let startLine: number, endLine: number;
    if (selection.isEmpty) {
      startLine = 1;
      endLine = doc.lineCount;
    } else {
      startLine = selection.start.line + 1;
      endLine = selection.end.line + 1;
    }

    try {
      // Verify git availability
      const gitVersion = await GitBlameCommand.execCmd('git --version', rootPath);
      if (!gitVersion.includes('git')) {
        vscode.window.showErrorMessage('Git is not available in this workspace.');
        return;
      }

      // Run git blame
      const blameCmd = `git blame -L ${startLine},${endLine} --date=short -- "${filePath}"`;
      const blameOutput = await GitBlameCommand.execCmd(blameCmd, rootPath);

      if (!blameOutput.trim()) {
        vscode.window.showInformationMessage('No git history for this file (might be untracked or new).');
        return;
      }

      // Also get the log for context
      const logCmd = `git log --oneline -5 -- "${filePath}" 2>/dev/null || echo "(no history)"`;
      const logOutput = await GitBlameCommand.execCmd(logCmd, rootPath);

      outputChannel.clear();
      outputChannel.appendLine(`# Git Blame: ${fileName}`);
      outputChannel.appendLine(`  Lines ${startLine}-${endLine}`);
      outputChannel.appendLine(`  File: ${filePath}`);
      outputChannel.appendLine('');

      // Parse and pretty-print blame
      const blameLines = blameOutput.trim().split('\n');
      const authors = new Map<string, number>();

      outputChannel.appendLine('## Line-by-Line History');
      for (const blameLine of blameLines) {
        // Format: commit_hash (author date line_num) line_content
        const match = blameLine.match(/^([a-f0-9]+)\s+\(([^)]+)\)\s*(.*)/);
        if (match) {
          const [, , authorInfo] = match;
          const authorParts = authorInfo.split(/\s+/);
          const date = authorParts[authorParts.length - 1] || '';
          const author = authorParts.slice(0, -1).join(' ').replace(/\d+$/, '').trim() || 'Unknown';
          const lineNum = authorParts[authorParts.length - 2] || '';
          const content = match[3] || '';

          outputChannel.appendLine(`  ${date}  ${author.padEnd(20)}  ${lineNum.padStart(4)}: ${content.trim()}`);

          authors.set(author, (authors.get(author) || 0) + 1);
        } else {
          outputChannel.appendLine(`  ${blameLine}`);
        }
      }

      outputChannel.appendLine('');
      outputChannel.appendLine('## Author Stats');
      for (const [author, count] of authors) {
        const pct = ((count / blameLines.length) * 100).toFixed(0);
        outputChannel.appendLine(`  ${author}: ${count} lines (${pct}%)`);
      }

      outputChannel.appendLine('');
      outputChannel.appendLine('## Recent Commits');
      outputChannel.appendLine(logOutput.trim());

      outputChannel.show();
    } catch (err: any) {
      vscode.window.showErrorMessage(`Git blame failed: ${err.message}`);
    }
  }

  private static getWorkspaceRoot(): string | undefined {
    const folders = vscode.workspace.workspaceFolders;
    if (!folders) {
      vscode.window.showErrorMessage('No workspace folder open.');
      return;
    }
    return folders[0].uri.fsPath;
  }

  private static execCmd(cmd: string, cwd: string): Promise<string> {
    return new Promise((resolve, reject) => {
      cp.exec(cmd, { cwd, maxBuffer: 2 * 1024 * 1024 }, (err, stdout, stderr) => {
        if (err) {
          reject(new Error(stderr || err.message));
        } else {
          resolve(stdout);
        }
      });
    });
  }
}

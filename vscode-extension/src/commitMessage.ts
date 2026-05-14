import * as vscode from 'vscode';
import * as cp from 'child_process';

const outputChannel = vscode.window.createOutputChannel('AI: Commit Message');

export class CommitMessageCommand {
  public static async execute(): Promise<void> {
    try {
      const rootPath = CommitMessageCommand.getWorkspaceRoot();
      if (!rootPath) return;

      // Verify git is available
      if (!(await CommitMessageCommand.isGitAvailable(rootPath))) {
        vscode.window.showErrorMessage(
          'Git is not installed or not available in this workspace.'
        );
        return;
      }

      // Get the diff — prefer staged, fall back to unstaged
      const { diff, diffContent, isStaged } = await CommitMessageCommand.getDiff(rootPath);

      if (!diff.trim()) {
        // No changes — offer to open the dashboard or explain code instead
        const choice = await vscode.window.showInformationMessage(
          'No changes detected. What would you like to do?',
          'Explain Active File',
          'Open Bwat Web'
        );
        if (choice === 'Explain Active File') {
          vscode.commands.executeCommand('aiProductivity.explainCode');
        } else if (choice === 'Open Bwat Web') {
          vscode.commands.executeCommand('aiProductivity.openBwatWeb');
        }
        return;
      }

      // Get branch name for context
      const branch = await CommitMessageCommand.execCommand(
        'git rev-parse --abbrev-ref HEAD', rootPath
      );

      // Build suggestion
      const suggestion = CommitMessageCommand.buildSuggestion(diff, branch.trim());

      outputChannel.clear();
      outputChannel.appendLine(`Branch: ${branch.trim()}`);
      outputChannel.appendLine(`Changes: ${isStaged ? 'staged' : 'unstaged'}`);
      outputChannel.appendLine('--- diff stat ---');
      outputChannel.appendLine(diff.trim());
      outputChannel.appendLine('---');
      outputChannel.appendLine('');
      outputChannel.appendLine(`Suggested: ${suggestion}`);

      // Show quick pick with options
      const pick = await vscode.window.showQuickPick(
        [
          {
            label: `$(git-commit) Commit: ${suggestion}`,
            description: 'Accept and commit',
            detail: 'Stages all changes and commits with this message',
            action: 'commit' as const,
          },
          {
            label: '$(edit) Edit message',
            description: 'Customize before committing',
            action: 'edit' as const,
          },
          {
            label: '$(sync) Regenerate',
            description: 'Generate a different suggestion',
            action: 'regenerate' as const,
          },
          {
            label: '$(eye) Preview changes',
            description: 'Show diff in output panel',
            action: 'preview' as const,
          },
          {
            label: '$(circle-slash) Cancel',
            description: 'Do nothing',
            action: 'cancel' as const,
          },
        ],
        { placeHolder: 'Choose an action for your commit' }
      );

      if (!pick || pick.action === 'cancel') return;

      if (pick.action === 'preview') {
        outputChannel.appendLine('\n--- full diff ---');
        outputChannel.appendLine(diffContent);
        outputChannel.show();
        return;
      }

      if (pick.action === 'regenerate') {
        // Generate a different style
        const altSuggestion = CommitMessageCommand.buildAlternativeSuggestion(diff, branch.trim());
        const msg = await vscode.window.showInputBox({
          title: 'Alternative Commit Message',
          prompt: 'Edit or confirm',
          value: altSuggestion,
        });
        if (!msg) return;
        await CommitMessageCommand.doCommit(rootPath, msg);
        return;
      }

      if (pick.action === 'edit') {
        const msg = await vscode.window.showInputBox({
          title: 'Commit Message',
          prompt: 'Enter your commit message',
          value: suggestion,
          validateInput: (v) => v.trim() ? null : 'Message cannot be empty',
        });
        if (!msg) return;
        await CommitMessageCommand.doCommit(rootPath, msg);
        return;
      }

      if (pick.action === 'commit') {
        await CommitMessageCommand.doCommit(rootPath, suggestion);
      }
    } catch (err: any) {
      vscode.window.showErrorMessage(`Commit error: ${err.message}`);
    }
  }

  // ── Private helpers ────────────────────────────────────────

  private static getWorkspaceRoot(): string | undefined {
    const folders = vscode.workspace.workspaceFolders;
    if (!folders) {
      vscode.window.showErrorMessage('No workspace folder open.');
      return;
    }
    return folders[0].uri.fsPath;
  }

  private static async isGitAvailable(cwd: string): Promise<boolean> {
    try {
      const out = await CommitMessageCommand.execCommand('git --version', cwd);
      return out.trim().length > 0;
    } catch {
      return false;
    }
  }

  private static async getDiff(
    cwd: string
  ): Promise<{ diff: string; diffContent: string; isStaged: boolean }> {
    let diff = await CommitMessageCommand.execCommand(
      'git diff --cached --stat', cwd
    );
    let diffContent = '';
    let isStaged = false;

    if (diff.trim()) {
      diffContent = await CommitMessageCommand.execCommand(
        'git diff --cached', cwd
      );
      isStaged = true;
    } else {
      diff = await CommitMessageCommand.execCommand('git diff --stat', cwd);
      if (diff.trim()) {
        diffContent = await CommitMessageCommand.execCommand('git diff', cwd);
      }
    }

    return { diff, diffContent, isStaged };
  }

  private static async doCommit(cwd: string, message: string): Promise<void> {
    // Ask before staging
    const stageChoice = await vscode.window.showQuickPick(
      [
        { label: '$(add) Stage all and commit', description: 'git add -A', detail: 'Stages all changes in the repo' },
        { label: '$(git-commit) Commit staged only', description: 'No git add — uses what\'s already staged' },
        { label: '$(circle-slash) Cancel', detail: '' },
      ],
      { placeHolder: 'How would you like to commit?' }
    );
    if (!stageChoice || stageChoice.label.includes('Cancel')) return;

    let commitCmd: string;
    if (stageChoice.label.includes('Stage all')) {
      await CommitMessageCommand.execCommand('git add -A', cwd);
      commitCmd = `git commit -m "${message.replace(/"/g, '\\"')}"`;
    } else {
      commitCmd = `git commit -m "${message.replace(/"/g, '\\"')}"`;
    }

    const result = await CommitMessageCommand.execCommand(commitCmd, cwd);
    vscode.window.showInformationMessage(`$(check) Committed: ${result.trim()}`);
  }

  private static execCommand(cmd: string, cwd: string): Promise<string> {
    return new Promise((resolve, reject) => {
      cp.exec(cmd, { cwd, maxBuffer: 2 * 1024 * 1024 }, (error, stdout, stderr) => {
        if (error) {
          reject(new Error(stderr || error.message));
        } else {
          resolve(stdout);
        }
      });
    });
  }

  private static buildSuggestion(diffStat: string, branch: string): string {
    const lines = diffStat.trim().split('\n');
    const changedFiles = lines.filter((l) => l.includes('|'));
    const branchLower = branch.toLowerCase();

    const type = CommitMessageCommand.detectType(branchLower);

    if (changedFiles.length === 0) {
      return `${type}: update project configuration`;
    }

    const fileSummary = changedFiles
      .map((f) => f.split('|')[0].trim())
      .slice(0, 4)
      .join(', ');

    const fileCount = changedFiles.length;
    const suffix = fileCount > 4
      ? `${fileSummary}, and ${fileCount - 4} more`
      : fileSummary;

    return `${type}: ${suffix}`;
  }

  private static buildAlternativeSuggestion(diffStat: string, branch: string): string {
    const lines = diffStat.trim().split('\n');
    const changedFiles = lines.filter((l) => l.includes('|'));
    const branchLower = branch.toLowerCase();

    const type = CommitMessageCommand.detectType(branchLower);
    const emojiMap: Record<string, string> = {
      feat: '✨',
      fix: '🐛',
      docs: '📝',
      refactor: '♻️',
      style: '💄',
      test: '✅',
      chore: '🔧',
    };
    const emoji = emojiMap[type] || '🔧';

    const files =
      changedFiles.length === 1
        ? changedFiles[0].split('|')[0].trim()
        : `${changedFiles.length} files`;

    return `${emoji} ${type}: update ${files}`;
  }

  private static detectType(branchLower: string): string {
    if (branchLower.startsWith('feat') || branchLower.includes('feature')) return 'feat';
    if (branchLower.startsWith('fix') || branchLower.includes('bug')) return 'fix';
    if (branchLower.startsWith('docs') || branchLower.includes('doc')) return 'docs';
    if (branchLower.startsWith('refactor')) return 'refactor';
    if (branchLower.startsWith('style') || branchLower.includes('format')) return 'style';
    if (branchLower.startsWith('test')) return 'test';
    return 'chore';
  }
}

import * as vscode from 'vscode';

const outputChannel = vscode.window.createOutputChannel('AI: Quick Refactor');

export class QuickRefactorCommand {
  public static async execute(): Promise<void> {
    const editor = vscode.window.activeTextEditor;
    if (!editor) {
      vscode.window.showWarningMessage('No active editor. Open a file first.');
      return;
    }

    const position = editor.selection.active;
    const doc = editor.document;

    // Get the word at cursor
    const wordRange = doc.getWordRangeAtPosition(position);
    if (!wordRange) {
      vscode.window.showWarningMessage('Place cursor on a symbol to refactor.');
      return;
    }

    const symbolName = doc.getText(wordRange);

    // Find references count
    const references = await vscode.commands.executeCommand<vscode.Location[]>(
      'vscode.executeReferenceProvider',
      doc.uri,
      position
    );

    const refCount = references ? references.length : 0;

    outputChannel.clear();
    outputChannel.appendLine(`# Quick Refactor: ${symbolName}`);
    outputChannel.appendLine('');
    outputChannel.appendLine(`  Symbol: ${symbolName}`);
    outputChannel.appendLine(`  File: ${doc.fileName.split('/').pop() || doc.fileName}`);
    outputChannel.appendLine(`  Line: ${position.line + 1}, Column: ${position.character + 1}`);
    outputChannel.appendLine(`  References: ${refCount}`);
    outputChannel.appendLine('');

    if (refCount === 0) {
      outputChannel.appendLine('This symbol has no references — it may be unused.');
    } else if (refCount === 1) {
      outputChannel.appendLine('This symbol is referenced in 1 location.');
    } else {
      outputChannel.appendLine(`Referenced in ${refCount} locations across the workspace.`);
    }

    outputChannel.appendLine('');

    // Offer rename via VS Code's native rename
    const choice = await vscode.window.showQuickPick(
      [
        {
          label: `$(symbol-rename) Rename "${symbolName}"`,
          description: `${refCount} reference(s) — uses VS Code's rename`,
          action: 'rename' as const,
        },
        {
          label: '$(eye) Preview all references',
          description: 'Show all locations in the output panel',
          action: 'preview' as const,
        },
        {
          label: '$(circle-slash) Cancel',
          action: 'cancel' as const,
        },
      ],
      { placeHolder: `What would you like to do with "${symbolName}"?` }
    );

    if (!choice || choice.action === 'cancel') return;

    if (choice.action === 'preview') {
      if (references) {
        for (const ref of references) {
          const refLine = ref.range.start.line + 1;
          const refFile = ref.uri.fsPath.split('/').pop() || ref.uri.fsPath;
          const refDoc = await vscode.workspace.openTextDocument(ref.uri);
          const lineText = refDoc.lineAt(ref.range.start.line).text.trim();
          outputChannel.appendLine(`  ${refFile}:${refLine}  —  ${lineText}`);
        }
        outputChannel.show();
      }
      return;
    }

    if (choice.action === 'rename') {
      // Trigger VS Code's native rename
      await vscode.commands.executeCommand('editor.action.rename', [
        doc.uri,
        position,
      ]);
    }
  }
}

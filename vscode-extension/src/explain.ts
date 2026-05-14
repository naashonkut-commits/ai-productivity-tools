import * as vscode from 'vscode';

const outputChannel = vscode.window.createOutputChannel('AI: Code Explain');

export class ExplainCommand {
  public static async execute(): Promise<void> {
    const editor = vscode.window.activeTextEditor;
    if (!editor) {
      vscode.window.showWarningMessage('No active editor. Open a file first.');
      return;
    }

    const document = editor.document;
    const selection = editor.selection;
    const hasSelection = !selection.isEmpty;
    const selectedText = hasSelection ? document.getText(selection) : document.getText();
    const language = document.languageId;
    const fileName = document.fileName.split('/').pop() || document.fileName;

    if (!selectedText.trim()) {
      vscode.window.showWarningMessage('No code to explain.');
      return;
    }

    outputChannel.clear();
    outputChannel.appendLine(`# Code Explanation: ${fileName}`);
    outputChannel.appendLine(`  Language: ${language}`);
    outputChannel.appendLine(`  File path: ${document.fileName}`);
    outputChannel.appendLine(`  Lines: ${document.lineCount}`);
    outputChannel.appendLine(`  Selection: ${hasSelection ? `lines ${selection.start.line + 1}-${selection.end.line + 1}, ${selectedText.split('\n').length} lines` : 'entire file'}`);
    outputChannel.appendLine('');

    // Count functions, classes, imports
    const functionMatches = selectedText.match(/(?:function\s+\w+|=>\s*{|def\s+\w+|fun\s+\w+)/g);
    const classMatches = selectedText.match(/(?:class\s+\w+|interface\s+\w+|struct\s+\w+)/g);
    const importMatches = selectedText.match(/(?:import|require|from)/g);

    if (functionMatches) {
      outputChannel.appendLine(`  Functions/methods detected: ${functionMatches.length}`);
    }
    if (classMatches) {
      outputChannel.appendLine(`  Classes/interfaces/structs: ${classMatches.length}`);
    }
    if (importMatches) {
      outputChannel.appendLine(`  Import/require statements: ${importMatches.length}`);
    }
    outputChannel.appendLine('');

    // Show full code
    outputChannel.appendLine(`## Code (${selectedText.split('\n').length} lines)`);
    outputChannel.appendLine('```' + language);
    outputChannel.appendLine(selectedText);
    outputChannel.appendLine('```');
    outputChannel.appendLine('');
    outputChannel.appendLine('## Summary');
    outputChannel.appendLine(`This ${language} code contains ${functionMatches ? functionMatches.length : 'several'} functional units across ${document.lineCount} lines. `
      + `Use the full AI chat in Bwat Web (Ctrl+Shift+W) for a natural-language breakdown, `
      + `refactoring suggestions, and best-practice analysis.`);

    outputChannel.show();
  }
}

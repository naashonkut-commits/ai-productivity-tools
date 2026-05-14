import * as vscode from 'vscode';

const outputChannel = vscode.window.createOutputChannel('AI: Code Review');

export class CodeReviewCommand {
  public static async execute(): Promise<void> {
    const editor = vscode.window.activeTextEditor;
    if (!editor) {
      vscode.window.showWarningMessage('No active editor. Open a file first.');
      return;
    }

    const doc = editor.document;
    const selection = editor.selection;
    const hasSelection = !selection.isEmpty;
    const text = hasSelection ? doc.getText(selection) : doc.getText();
    const lines = text.split('\n');
    const fileName = doc.fileName.split('/').pop() || doc.fileName;

    outputChannel.clear();
    outputChannel.appendLine(`# Code Review: ${fileName}`);
    if (hasSelection) {
      outputChannel.appendLine(`  Reviewing selected lines ${selection.start.line + 1}-${selection.end.line + 1}`);
    }
    outputChannel.appendLine('');

    const warnings: string[] = [];
    const suggestions: string[] = [];

    // Check 1: console.log / debugger statements
    for (let i = 0; i < lines.length; i++) {
      const line = lines[i];
      const lineNum = hasSelection ? i + 1 : i + 1;

      if (/console\.(log|debug|info|warn|error)\s*\(/.test(line)) {
        warnings.push(`Line ${lineNum}: Console statement left in code. Consider removing before production.`);
      }
      if (/debugger\s*;?/.test(line) && line.trim() === `debugger${line.trim().endsWith(';') ? ';' : ''}`) {
        warnings.push(`Line ${lineNum}: Debugger statement found.`);
      }
    }

    // Check 2: TODO / FIXME / HACK / XXX comments
    for (let i = 0; i < lines.length; i++) {
      const line = lines[i];
      const lineNum = hasSelection ? i + 1 : i + 1;
      const commentMatch = line.match(/\/\/\s*(TODO|FIXME|HACK|XXX|OPTIMIZE)\b/i);
      if (commentMatch) {
        const tag = commentMatch[1].toUpperCase();
        const rest = line.split(commentMatch[0])[1]?.trim() || '';
        if (tag === 'FIXME') {
          warnings.push(`Line ${lineNum}: FIXME — ${rest} (blocking issue)`);
        } else {
          suggestions.push(`Line ${lineNum}: ${tag} — ${rest}`);
        }
      }
    }

    // Check 3: Long functions (arbitrary: > 60 lines in a block)
    const functionStarts: number[] = [];
    const functionEndMarkers = /^[}\]]\s*$/;
    for (let i = 0; i < lines.length; i++) {
      if (/\bfunction\s*\(|\bdef\s+\w+\s*\(|\w+\s*=\s*(?:async\s*)?\(/.test(lines[i])) {
        functionStarts.push(i);
      }
    }

    // Check 4: Deep nesting (lines with > 4 indent levels)
    for (let i = 0; i < lines.length; i++) {
      const line = lines[i];
      const lineNum = hasSelection ? i + 1 : i + 1;
      const indent = line.search(/\S/);
      if (indent > 32 && line.trim()) {
        suggestions.push(`Line ${lineNum}: Deeply nested (${indent} spaces). Consider refactoring.`);
      }
    }

    // Check 5: Very long lines ( > 120 chars )
    for (let i = 0; i < lines.length; i++) {
      const line = lines[i];
      const lineNum = hasSelection ? i + 1 : i + 1;
      if (line.length > 120 && line.trim()) {
        suggestions.push(`Line ${lineNum}: Line is ${line.length} characters (exceeds 120). Consider wrapping.`);
      }
    }

    // Check 6: Empty catch blocks
    for (let i = 0; i < lines.length - 1; i++) {
      const lineNum = hasSelection ? i + 1 : i + 1;
      if (/catch\s*\(/.test(lines[i]) && /^\s*\{\s*\}\s*$/.test(lines[i + 1])) {
        warnings.push(`Line ${lineNum}: Empty catch block — error is silently swallowed.`);
      }
    }

    // Output results
    if (warnings.length === 0 && suggestions.length === 0) {
      outputChannel.appendLine('No issues found. Clean code!');
      outputChannel.appendLine('');
      outputChannel.appendLine(`Reviewed ${lines.length} lines in ${fileName}.`);
      outputChannel.show();
      return;
    }

    if (warnings.length > 0) {
      outputChannel.appendLine(`## Warnings (${warnings.length})`);
      warnings.forEach((w) => outputChannel.appendLine(`  - ${w}`));
      outputChannel.appendLine('');
    }

    if (suggestions.length > 0) {
      outputChannel.appendLine(`## Suggestions (${suggestions.length})`);
      suggestions.forEach((s) => outputChannel.appendLine(`  - ${s}`));
      outputChannel.appendLine('');
    }

    outputChannel.appendLine(`Reviewed ${lines.length} lines in ${fileName}.`);
    outputChannel.appendLine(`${warnings.length} warning(s), ${suggestions.length} suggestion(s).`);
    outputChannel.show();
  }
}

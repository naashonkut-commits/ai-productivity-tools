import * as vscode from 'vscode';

const outputChannel = vscode.window.createOutputChannel('AI: Summarize File');

export class SummarizeFileCommand {
  public static async execute(): Promise<void> {
    const editor = vscode.window.activeTextEditor;
    if (!editor) {
      vscode.window.showWarningMessage('No active editor. Open a file first.');
      return;
    }

    const doc = editor.document;
    const text = doc.getText();
    const lines = doc.lineCount;
    const fileName = doc.fileName.split('/').pop() || doc.fileName;
    const language = doc.languageId;
    const fileSize = Buffer.byteLength(text, 'utf-8');

    // Count various metrics
    const emptyLines = text.split('\n').filter((l) => l.trim() === '').length;
    const commentLines = text.split('\n').filter((l) => {
      const t = l.trim();
      return t.startsWith('//') || t.startsWith('#') || t.startsWith('/*') || t.startsWith('*') || t.startsWith('--');
    }).length;
    const codeLines = lines - emptyLines - commentLines;

    const functions = text.match(/(?:function\s+\w+|=>\s*{|def\s+\w+|fun\s+\w+|async\s+function)/g) || [];
    const classes = text.match(/(?:class\s+\w+|interface\s+\w+|struct\s+\w+|trait\s+\w+)/g) || [];
    const imports = text.match(/(?:import|require|from\s+['"])/g) || [];
    const exports = text.match(/(?:export|module\.exports)/g) || [];

    outputChannel.clear();
    outputChannel.appendLine(`# File Summary: ${fileName}`);
    outputChannel.appendLine('');
    outputChannel.appendLine(`| Metric | Value |`);
    outputChannel.appendLine(`|--------|-------|`);
    outputChannel.appendLine(`| Language | ${language} |`);
    outputChannel.appendLine(`| Total lines | ${lines} |`);
    outputChannel.appendLine(`| Code lines | ${codeLines} |`);
    outputChannel.appendLine(`| Empty lines | ${emptyLines} |`);
    outputChannel.appendLine(`| Comment lines | ${commentLines} |`);
    outputChannel.appendLine(`| File size | ${fileSize < 1024 ? fileSize + ' B' : (fileSize / 1024).toFixed(1) + ' KB'} |`);
    outputChannel.appendLine(`| Functions/Methods | ${functions.length} |`);
    outputChannel.appendLine(`| Classes/Interfaces | ${classes.length} |`);
    outputChannel.appendLine(`| Import statements | ${imports.length} |`);
    outputChannel.appendLine(`| Export statements | ${exports.length} |`);
    outputChannel.appendLine('');

    if (functions.length > 0) {
      outputChannel.appendLine('## Functions Detected');
      functions.forEach((f) => outputChannel.appendLine(`  - ${f.replace(/\s*{.*/, '').trim()}`));
      outputChannel.appendLine('');
    }

    if (classes.length > 0) {
      outputChannel.appendLine('## Classes & Interfaces');
      classes.forEach((c) => outputChannel.appendLine(`  - ${c}`));
      outputChannel.appendLine('');
    }

    outputChannel.appendLine('## Health Indicators');
    const avgFuncLen = functions.length > 0 ? Math.round(codeLines / functions.length) : 0;
    if (avgFuncLen > 50) {
      outputChannel.appendLine(`  - Warning: Average function length ~${avgFuncLen} lines. Consider refactoring.`);
    } else {
      outputChannel.appendLine(`  - Average function length: ~${avgFuncLen} lines (healthy).`);
    }
    if (commentLines < codeLines * 0.05 && codeLines > 100) {
      outputChannel.appendLine(`  - Low comment ratio (${((commentLines / codeLines) * 100).toFixed(1)}%). Consider adding docs.`);
    } else {
      outputChannel.appendLine(`  - Comment ratio: ${((commentLines / Math.max(codeLines, 1)) * 100).toFixed(1)}%.`);
    }

    outputChannel.show();
  }
}

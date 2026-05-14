import * as vscode from 'vscode';

const outputChannel = vscode.window.createOutputChannel('AI: Unused Imports');

export class UnusedImportsCommand {
  public static async execute(): Promise<void> {
    const editor = vscode.window.activeTextEditor;
    if (!editor) {
      vscode.window.showWarningMessage('No active editor. Open a file first.');
      return;
    }

    const doc = editor.document;
    const text = doc.getText();
    const lines = text.split('\n');
    const language = doc.languageId;

    // Find import lines
    const importPatterns: Record<string, RegExp> = {
      typescript: /^import\s+(?:\{[^}]*\}|\*\s+as\s+\w+|\w+(?:\s*,\s*\{[^}]*\})?)\s+from\s+['"][^'"]+['"]\s*;?$/,
      javascript: /^(?:import|const\s+\w+\s*=\s*require|let\s+\w+\s*=\s*require|var\s+\w+\s*=\s*require)/,
      python: /^(?:import\s+\w+|from\s+\w+\s+import)/,
      java: /^import\s+[\w.]+;/,
      php: /^(?:use\s+[\w\\]+|require|include)/,
    };

    const pattern = importPatterns[language] || /^(?:import|use|require)/;
    const importLines: { line: number; text: string; name: string }[] = [];

    for (let i = 0; i < lines.length; i++) {
      const line = lines[i];
      if (pattern.test(line.trim())) {
        // Extract the imported name(s)
        const name = UnusedImportsCommand.extractName(line, language);
        importLines.push({ line: i, text: line.trim(), name });
      }
    }

    if (importLines.length === 0) {
      vscode.window.showInformationMessage('No import statements found in this file.');
      return;
    }

    // Check each import for usage
    const unused: { line: number; text: string; name: string }[] = [];
    const bodyText = text; // full text to check references

    for (const imp of importLines) {
      const name = imp.name;
      if (!name) continue;

      // Count occurrences of the imported name in the file body
      // Skip the import line itself
      const bodyWithoutImport = lines
        .filter((_, idx) => idx !== imp.line)
        .join('\n');

      const escapedName = name.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
      const regex = new RegExp(escapedName, 'g');
      const matches = bodyWithoutImport.match(regex);

      if (!matches || matches.length === 0) {
        unused.push(imp);
      }
    }

    outputChannel.clear();

    if (unused.length === 0) {
      outputChannel.appendLine(`# Unused Imports: ${doc.fileName.split('/').pop()}`);
      outputChannel.appendLine('');
      outputChannel.appendLine(`All ${importLines.length} imports appear to be used. Good job!`);
      outputChannel.show();
      return;
    }

    outputChannel.appendLine(`# Unused Imports Found: ${unused.length}/${importLines.length}`);
    outputChannel.appendLine(`  File: ${doc.fileName}`);
    outputChannel.appendLine('');

    for (const imp of unused) {
      outputChannel.appendLine(`  Line ${imp.line + 1}: ${imp.text}`);
    }

    outputChannel.appendLine('');
    outputChannel.appendLine('Tip: Remove unused imports to keep your codebase clean.');
    outputChannel.show();

    // Offer to remove them
    const choice = await vscode.window.showWarningMessage(
      `${unused.length} unused import(s) found. Remove them?`,
      'Remove All',
      'Cancel'
    );

    if (choice === 'Remove All') {
      const edit = new vscode.WorkspaceEdit();
      const uri = doc.uri;
      // Sort in reverse line order so line numbers don't shift
      const sorted = [...unused].sort((a, b) => b.line - a.line);
      for (const imp of sorted) {
        const lineRange = doc.lineAt(imp.line).range;
        // Include the newline
        const range = new vscode.Range(
          lineRange.start,
          imp.line < doc.lineCount - 1
            ? doc.lineAt(imp.line + 1).range.start
            : lineRange.end
        );
        edit.delete(uri, range);
      }
      await vscode.workspace.applyEdit(edit);
      vscode.window.showInformationMessage(`Removed ${unused.length} unused import(s).`);
    }
  }

  private static extractName(line: string, language: string): string {
    // TypeScript/JavaScript: import { Foo } from ... → Foo; import Foo from → Foo
    if (language === 'typescript' || language === 'javascript') {
      const defaultMatch = line.match(/^import\s+(\w+)\s+from/);
      if (defaultMatch) return defaultMatch[1];

      const namedMatch = line.match(/\{\s*(\w+)/);
      if (namedMatch) return namedMatch[1];

      const nsMatch = line.match(/\*\s+as\s+(\w+)/);
      if (nsMatch) return nsMatch[1];

      const requireMatch = line.match(/(?:const|let|var)\s+(\w+)\s*=\s*require/);
      if (requireMatch) return requireMatch[1];

      return '';
    }

    // Python: import foo → foo, from foo import bar → bar
    if (language === 'python') {
      const fromMatch = line.match(/^from\s+\w+\s+import\s+(\w+)/);
      if (fromMatch) return fromMatch[1];
      const importMatch = line.match(/^import\s+(\w+)/);
      if (importMatch) return importMatch[1];
      return '';
    }

    // Java: import com.example.Foo → Foo
    if (language === 'java') {
      const parts = line.split('.');
      return parts[parts.length - 1].replace(';', '');
    }

    // PHP: use App\Models\User → User
    if (language === 'php') {
      const parts = line.split('\\');
      return parts[parts.length - 1].replace(';', '');
    }

    return '';
  }
}

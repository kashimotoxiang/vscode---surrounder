'use strict';
const vscode = require("vscode");

function edit(mode) {
    let editor = vscode.window.activeTextEditor;
    let selection = editor.selection;
    if (selection.isEmpty) {
        selection = getCurrentLineSelection(selection);
    }
    let lines = getSelectLines(selection);
    let startLine = lines[0];
    let firstLineNumber = startLine.lineNumber;
    let endLine = lines[lines.length - 1];

    let lang = editor.document.languageId.toLowerCase();
    if (mode == "IF") {
        editor.edit(currentText => {
            currentText.replace(startLine.range.union(endLine.range), surroundWithIf(selection, lang));
        });
    } else if (mode == "TRY") {
        editor.edit(currentText => {
            currentText.replace(startLine.range.union(endLine.range), surroundWithTry(selection, lang));
        });
    }
    editor.edit(currentText => {
        const firstLine = editor.document.lineAt(firstLineNumber);
        var pisition = new vscode.Position(firstLine.lineNumber, firstLine.firstNonWhitespaceCharacterIndex)
        editor.selection = new vscode.Selection(pisition, pisition);
    });
}

function activate(context) {
    let ifSurround = vscode.commands.registerCommand('extension.surroundWithIf', () => edit("IF"));
    let trySurround = vscode.commands.registerCommand('extension.surroundWithTry', () => edit("TRY"));
    context.subscriptions.push(ifSurround);
    context.subscriptions.push(trySurround);
}
exports.activate = activate;

function surroundWithIf(selection, lang) {
    let lines = getSelectLines(selection);
    const {
        prefix
    } = getPrefixAndIndent(lines[0]);
    if (lang == 'python') {
        return [
            `${prefix}if (condition):`,
            ...indentLines(lines),
            `${prefix}}`
        ].join('\n');
    } else if (lang == 'javascript') {
        return [
            `${prefix}if (condition) {`,
            ...indentLines(lines),
            `${prefix}}`
        ].join('\n');
    }
    return lines
}

function surroundWithTry(selection, lang) {
    let lines = getSelectLines(selection);
    const {
        prefix,
        indent
    } = getPrefixAndIndent(lines[0]);
    if (lang == 'python') {
        return [
            `${prefix}try:`,
            ...indentLines(lines),
            `${prefix}} except Exception as e:`,
            `${prefix}${indent}print(error)`,
            `${prefix}}`,
        ].join('\n');
    } else if (lang == 'javascript') {
        return [
            `${prefix}try {`,
            ...indentLines(lines),
            `${prefix}} catch (error) {`,
            `${prefix}${indent}console.error(error)`,
            `${prefix}}`,
        ].join('\n');
    }
    return lines


}

function getCurrentLineSelection(selection) {
    const pos = selection.active;
    let line = vscode.window.activeTextEditor.document.lineAt(pos.line);
    return line.range;
}

function getPrefixAndIndent(line) {
    let indentLength = line.firstNonWhitespaceCharacterIndex;
    const {
        tabSize,
        insertSpaces
    } = vscode.window.activeTextEditor.options;
    return {
        indent: new Array(tabSize + 1).join(insertSpaces ? ' ' : '\t'),
        prefix: new Array(indentLength + 1).join(insertSpaces ? ' ' : '\t')
    };
}

function getSelectLines(selection) {
    let linesCount = selection.start.line - selection.end.line;
    let lines = [];
    for (let i = selection.start.line; i < selection.end.line + 1; i++) {
        lines.push(vscode.window.activeTextEditor.document.lineAt(i));
    }
    return lines;
}

function indentLines(lines) {
    const {
        tabSize,
        insertSpaces
    } = vscode.window.activeTextEditor.options;
    let prefix = insertSpaces ? new Array(tabSize + 1).join(' ') : '\t';
    return lines.map(line => prefix + line.text);
}
//# sourceMappingURL=extension.js.map
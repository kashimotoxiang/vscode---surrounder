'use strict';
var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    return new(P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) {
            try {
                step(generator.next(value));
            } catch (e) {
                reject(e);
            }
        }

        function rejected(value) {
            try {
                step(generator["throw"](value));
            } catch (e) {
                reject(e);
            }
        }

        function step(result) {
            result.done ? resolve(result.value) : new P(function (resolve) {
                resolve(result.value);
            }).then(fulfilled, rejected);
        }
        step((generator = generator.apply(thisArg, _arguments)).next());
    });
};
const vscode = require("vscode");

function editer() {
    let editor = vscode.window.activeTextEditor;
    let selection = editor.selection;
    if (selection.isEmpty) {
        selection = getCurrentLineSelection(selection);
    }
    let lines = getSelectLines(selection);
    let startLine = lines[0];
    let catchBodyLineNumber = lines.length + 2;
    let endLine = lines[lines.length - 1];
    editor.edit(currentText => {
        currentText.replace(startLine.range.union(endLine.range), surroundWithTry(selection));
    });
    editor.edit(currentText => {
        const catchLine = editor.document.lineAt(catchBodyLineNumber);
        editor.selection = new vscode.Selection(new vscode.Position(catchLine.lineNumber, catchLine.firstNonWhitespaceCharacterIndex), new vscode.Position(catchLine.lineNumber, catchLine.firstNonWhitespaceCharacterIndex + catchLine.text.length));
    });
}

function activate(context) {
    let ifSurround = vscode.commands.registerCommand('extension.surroundWithIf', () => __awaiter(this, void 0, void 0, function* () {
        let editor = vscode.window.activeTextEditor;
        let selection = editor.selection;
        if (selection.isEmpty) {
            selection = getCurrentLineSelection(selection);
        }
        let lines = getSelectLines(selection);
        let startLine = lines[0];
        let firstLineNumber = startLine.lineNumber;
        let endLine = lines[lines.length - 1];
        editor.edit(currentText => {
            currentText.replace(startLine.range.union(endLine.range), surroundWithIf(selection));
        });
        editor.edit(currentText => {
            const firstLine = editor.document.lineAt(firstLineNumber);
            editor.selection = new vscode.Selection(new vscode.Position(firstLine.lineNumber, firstLine.firstNonWhitespaceCharacterIndex + 4), new vscode.Position(firstLine.lineNumber, firstLine.firstNonWhitespaceCharacterIndex + 13));
        });
    }));
    let trySurround = vscode.commands.registerCommand('extension.surroundWithTry', () => edit());
    context.subscriptions.push(ifSurround);
    context.subscriptions.push(trySurround);
}
exports.activate = activate;

function surroundWithIf(selection) {
    let lines = getSelectLines(selection);
    const {
        prefix
    } = getPrefixAndIndent(lines[0]);
    return [
        `${prefix}if (condition) {`,
        ...indentLines(lines),
        `${prefix}}`
    ].join('\n');
}

function surroundWithTry(selection) {
    let lines = getSelectLines(selection);
    const {
        prefix,
        indent
    } = getPrefixAndIndent(lines[0]);
    return [
        `${prefix}try {`,
        ...indentLines(lines),
        `${prefix}} catch (error) {`,
        `${prefix}${indent}console.error(error)`,
        `${prefix}}`,
    ].join('\n');
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
import * as vscode from "vscode";

import { throttle } from "./utils";

const getExtensionConfiguration = () => {
  const config = vscode.workspace.getConfiguration("generatedSourceWarning");
  return {
    generatedFileUriPattern: new RegExp(config.get<string>("generatedFileUriPattern", "")),
    generatedMarker: config.get<string>("generatedMarker", ""),
  };
};

function diagnosticForDocument(document: vscode.TextDocument): vscode.Diagnostic {
  return {
    range: new vscode.Range(0, 0, document.lineCount, 0),
    message: "The file contents may be overwritten externally.",
    severity: vscode.DiagnosticSeverity.Hint,
    tags: [vscode.DiagnosticTag.Unnecessary],
  };
}

function checkForMarker(document: vscode.TextDocument, marker: string): boolean {
  return document.lineCount > 0 && document.lineAt(0).text.includes(marker);
}

export function activate(context: vscode.ExtensionContext) {
  const config = getExtensionConfiguration();

  const shouldWarnAgainst = (doc: vscode.TextDocument) =>
    !doc.isClosed &&
    !doc.isUntitled &&
    (checkForMarker(doc, config.generatedMarker) ||
      config.generatedFileUriPattern.test(doc.uri.toString()));

  const diagnostics = vscode.languages.createDiagnosticCollection("generatedMarker");
  const add = (doc: vscode.TextDocument) => diagnostics.set(doc.uri, [diagnosticForDocument(doc)]);
  const remove = (doc: vscode.TextDocument) => diagnostics.delete(doc.uri);

  const addIfEligible = (doc: vscode.TextDocument) => shouldWarnAgainst(doc) && add(doc);

  const throttledWarning = throttle(
    () =>
      vscode.window.showWarningMessage(
        "Take caution when editing this file, as its contents may be overwritten externally.",
      ),
    3000,
  );
  context.subscriptions.concat([
    diagnostics,
    // Grey out the opened, generated files
    vscode.workspace.onDidOpenTextDocument(addIfEligible),
    vscode.workspace.onDidCloseTextDocument(remove),
    // And warn if a user edits such a file
    vscode.workspace.onDidChangeTextDocument(
      (doc) => shouldWarnAgainst(doc.document) && throttledWarning(),
    ),
  ]);

  // Run the check for all visible text editors on start-up
  vscode.window.visibleTextEditors
    // Filter out the `Output` panel
    .filter((editor) => editor.document.uri.scheme !== "output")
    .forEach((editor) => addIfEligible(editor.document));
}

export function deactivate() {}

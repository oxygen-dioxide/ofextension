// The module 'vscode' contains the VS Code extensibility API
// Import the module and reference it with the alias vscode in your code below
const vscode = require('vscode');

// this method is called when your extension is activated
// your extension is activated the very first time the command is executed

/**
 * @param {vscode.ExtensionContext} context
 */
function activate(context) {
	// Use the console to output diagnostic information (console.log) and errors (console.error)
	// This line of code will only be executed once when your extension is activated
	console.log('Congratulations, your extension "ofextension" is now active!');
	// const wkspaceRoot=vscode.workspace.workspaceFolders[0].uri.fsPath;
	require('./ofInit')(context); // ofInit 
	// context.require('./ofDebugConf')(context); // ofInit 

	// let disposable = vscode.commands.registerCommand('ofextension.helloWorld', function () {
	// 	vscode.window.showInformationMessage('Hello World from OFextension!');
	// });
	// context.subscriptions.push(disposable);

}

// this method is called when your extension is deactivated
function deactivate() {}

module.exports = {
	activate,
	deactivate
}

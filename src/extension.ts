import * as vscode from 'vscode';
import { DevBuddy } from './dev-buddy';

export function activate(context: vscode.ExtensionContext) {
	console.log('Congratulations, your extension "dev-buddy-openai" is now active!');

	const openaiApiKey = process.env.OPENAI_API_KEY;
	if (!openaiApiKey) {
		vscode.window.showErrorMessage('The OPENAI_API_KEY environment variable is not set');
		return;
	}
	const devBuddy = new DevBuddy(openaiApiKey);

	let disposable = vscode.commands.registerCommand('dev-buddy-openai.completeComments', async () => {
		const editor = vscode.window.activeTextEditor;
		if (!editor) {
			return;
		}

		const languageId = editor.document.languageId;
		const selection = editor.selection;
		const selectedText = editor.document.getText(selection);

		const functionSuccess = (newText: string) => {
			editor.edit(editBuilder => {
				editBuilder.replace(selection, newText);
			});
		};
		const functionFailure = (errorMessage: string) => {
			vscode.window.showErrorMessage(`An error occurred while completing the code: ${errorMessage}`);
		};

		devBuddy.completeComments(selectedText, languageId, functionSuccess, functionFailure);
	});

	context.subscriptions.push(disposable);
}

export function deactivate() { }

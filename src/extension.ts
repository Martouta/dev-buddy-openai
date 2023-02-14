import * as vscode from 'vscode';
import { DevBuddy } from './dev-buddy';

export function activate(context: vscode.ExtensionContext) {
	console.log('Congrats, your extension "dev-buddy-openai" is now active! 🎉');

	const openaiApiKey = process.env.OPENAI_API_KEY;
	if (!openaiApiKey) {
		vscode.window.showErrorMessage('The OPENAI_API_KEY environment variable is not set');
		return;
	}

	const devBuddy = new DevBuddy(openaiApiKey);
	const completeCommentsCommand = createCommandCompleteComments(devBuddy);
	let disposable = vscode.commands.registerCommand('dev-buddy-openai.completeComments', completeCommentsCommand);
	context.subscriptions.push(disposable);
}

function createCommandCompleteComments(devBuddy: DevBuddy): () => void {
	return async () => {
		const editor = vscode.window.activeTextEditor;
		if (!editor) {
			return;
		}

		const languageId = editor.document.languageId;
		const selection = editor.selection;
		const selectedText = editor.document.getText(selection);

		console.log('completeComments requested');

		devBuddy.completeComments(selectedText, languageId)
			.then((newText: string) => {
				editor.edit(editBuilder => {
					editBuilder.replace(selection, newText);
				});
			})
			.catch((errorMessage: string) => {
				vscode.window.showErrorMessage(`An error occurred while completing the code: ${errorMessage}`);
			});
	};
}

export function deactivate() { }

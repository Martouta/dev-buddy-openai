/* eslint-disable @typescript-eslint/naming-convention */
import * as vscode from 'vscode';
import { Configuration, OpenAIApi } from "openai";

export function activate(context: vscode.ExtensionContext) {
	console.log('Congratulations, your extension "dev-buddy-openai" is now active!');

	const openaiApiKey = process.env.OPENAI_API_KEY;
	if (!openaiApiKey) {
		vscode.window.showErrorMessage('The OPENAI_API_KEY environment variable is not set');
		return;
	}
	const configuration = new Configuration({ apiKey: openaiApiKey });
	const openai = new OpenAIApi(configuration);

	let disposable = vscode.commands.registerCommand('dev-buddy-openai.completeComments', async () => {
		const editor = vscode.window.activeTextEditor;
		if (!editor) {
			return;
		}

		const languageId = editor.document.languageId;
		const selection = editor.selection;
		const selectedText = editor.document.getText(selection);
		const requestText = [
			'Replace all the "TODO" and "FIXME" comments from the following code',
			'for the code that actually does what the comment expects',
			'and remove the entire comment after the "TODO" or "FIXME":',
			'```' + languageId,
			selectedText,
			'```'
		].join("\n");

		console.log(requestText);

		try {
			const completion = (await openai.createCompletion({
				model: "text-davinci-003",
				prompt: requestText,
				temperature: 0.7,
				max_tokens: 256,
				top_p: 1,
				frequency_penalty: 0,
				presence_penalty: 0,
			})).data;
			console.log(completion);
			const newText = completion.choices[0].text?.trim() || selectedText;

			editor.edit(editBuilder => {
				editBuilder.replace(selection, newText);
			});
		} catch (error: any) {
			vscode.window.showErrorMessage(`An error occurred while completing the code: ${error.message}`);
		}
	});

	context.subscriptions.push(disposable);
}

export function deactivate() { }

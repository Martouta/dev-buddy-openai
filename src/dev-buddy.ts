/* eslint-disable @typescript-eslint/naming-convention */
import { Configuration, OpenAIApi } from "openai";

interface OpenAIConfigureFunction {
	createCompletion(prompt: Record<string, any>): Promise<any>;
}

export class DevBuddy {
	public openai: OpenAIConfigureFunction;

	constructor(openaiApiKey: string, configureFunction?: (openaiApiKey: string) => OpenAIConfigureFunction) {
		this.openai = configureFunction ? configureFunction(openaiApiKey) : DevBuddy.configureOpenAI(openaiApiKey);
	}

	static configureOpenAI(openaiApiKey: string): OpenAIApi {
		const configuration = new Configuration({ apiKey: openaiApiKey });
		return new OpenAIApi(configuration);
	}

	async completeComments(selectedText: string, languageId: string, functionSuccess: (newText: string) => void, functionFailure: (errorMessage: string) => void) {
		try {
			const requestBody = DevBuddy.requestBody(selectedText, languageId)
			const completion = (await this.openai.createCompletion(requestBody)).data;
			const newText = completion.choices[0].text?.trim() || selectedText;

			functionSuccess(newText);
		} catch (error: any) {
			functionFailure(error.message);
		}
	}

	static requestBody(selectedText: string, languageId: string) {
		const requestText = [
			'Replace all the "TODO" and "FIXME" comments from the following code',
			'for the code that actually does what the comment expects',
			'and remove the entire comment after the "TODO" or "FIXME":',
			'```' + languageId,
			selectedText,
			'```'
		].join("\n");

		return {
			model: "text-davinci-003",
			prompt: requestText,
			temperature: 0.7,
			max_tokens: 256,
			top_p: 1,
			frequency_penalty: 0,
			presence_penalty: 0,
		};
	}
}

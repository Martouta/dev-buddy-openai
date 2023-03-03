/* eslint-disable @typescript-eslint/naming-convention */
import { Configuration, OpenAIApi } from "openai";

interface OpenAIConfigureFunction {
	createChatCompletion(requestBody: object): Promise<any>;
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

	async completeComments(selectedText: string, languageId: string) {
		try {
			const requestText = DevBuddy.requestTextWithLanguageId(selectedText, languageId);
			const requestBody = DevBuddy.requestBody(requestText);

			const completion = await this.openai.createChatCompletion(requestBody);

			const newText = DevBuddy.newText(completion);

			return newText;
		} catch (error: any) {
			throw new Error(error.message);
		}
	}

	static newText(completion: any) {
		const responseText = completion.data.choices[0].message.content.trim();

		if (
			responseText.startsWith("```") &&
			(responseText.endsWith("```") || responseText.endsWith("```\n"))
		) {
			const startIndex = responseText.indexOf("\n") + 1;
			const endIndex = responseText.lastIndexOf("\n", responseText.length - 4);
			return responseText.substring(startIndex, endIndex);
		}

		return responseText;
	}

	static requestTextWithLanguageId(selectedText: string, languageId: string) {
		return [
			'```' + languageId,
			selectedText,
			'```'
		].join("\n");
	}

	static requestBody(requestText: string) {
		return {
			model: "gpt-3.5-turbo",
			messages: [
				{
					"role": "system", "content": [
						"You receive code and respond with the same code",
						"replacing all the 'TODO' and 'FIXME' comments",
						"for the code that actually does what the comment expects.",
						"The comments should also be removed after the 'TODO' or 'FIXME'."
					].join(" ")
				},
				{ "role": "user", "content": requestText }
			]
		};
	}
}

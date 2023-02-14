/* eslint-disable @typescript-eslint/naming-convention */
import { DevBuddy } from "../dev-buddy";
import { OpenAIApi } from "openai";

describe("DevBuddy", () => {
  describe("configureOpenAI", () => {
    it("returns an instance of OpenAIApi", () => {
      const openai = DevBuddy.configureOpenAI('example-api-key');
      expect(openai).toBeInstanceOf(OpenAIApi);
    });
  });

  describe("requestBody", () => {
    it("returns an object with the expected properties", () => {
      const selectedText = "lambda { |num| num * 2 }";
      const languageId = "ruby";
      const requestBody = DevBuddy.requestBody(selectedText, languageId);

      expect(requestBody).toHaveProperty("model");
      expect(requestBody).toHaveProperty("prompt");
      expect(requestBody).toHaveProperty("temperature");
      expect(requestBody).toHaveProperty("max_tokens");
      expect(requestBody).toHaveProperty("top_p");
      expect(requestBody).toHaveProperty("frequency_penalty");
      expect(requestBody).toHaveProperty("presence_penalty");

      expect(requestBody.model).toEqual("text-davinci-003");

      const expectedPrompt = [
        'Replace all the "TODO" and "FIXME" comments from the following code',
        'for the code that actually does what the comment expects',
        'and remove the entire comment after the "TODO" or "FIXME":',
        '```ruby',
        selectedText,
        '```'
      ].join("\n");

      expect(requestBody.prompt).toEqual(expectedPrompt);
    });
  });

  // TODO: test much more ...
  describe("completeComments", () => {
    it("calls success callback with new text", async () => {
      // Set up a mock implementation for the OpenAI API client
      const openaiMock = {
        createCompletion: jest.fn().mockResolvedValue({
          data: {
            choices: [
              {
                text: "new code",
              },
            ],
          },
        }),
      };

      // Create a DevBuddy instance with the mock OpenAI API client
      const devBuddy = new DevBuddy("openaiApiKey", () => openaiMock);

      // Set up the success and failure callbacks
      const successCallback = jest.fn();
      const failureCallback = jest.fn();

      // Call completeComments with some sample arguments
      await devBuddy.completeComments(
        "selected text",
        "typescript",
        successCallback,
        failureCallback
      );

      // Verify that the success callback was called with the expected new text
      expect(successCallback).toHaveBeenCalledWith("new code");

      // Verify that the failure callback was not called
      expect(failureCallback).not.toHaveBeenCalled();

      // Verify that the OpenAI API client was called with the expected parameters
      expect(openaiMock.createCompletion).toHaveBeenCalledWith({
        model: "text-davinci-003",
        prompt:
          'Replace all the "TODO" and "FIXME" comments from the following code\nfor the code that actually does what the comment expects\nand remove the entire comment after the "TODO" or "FIXME":\n```typescript\nselected text\n```',
        temperature: 0.7,
        max_tokens: 256,
        top_p: 1,
        frequency_penalty: 0,
        presence_penalty: 0,
      });
    });

    it("calls failure callback with error message", async () => {
      // Set up a mock implementation for the OpenAI API client that throws an error
      const openaiMock = {
        createCompletion: jest.fn().mockRejectedValue(new Error("test error")),
      };

      // Create a DevBuddy instance with the mock OpenAI API client
      const devBuddy = new DevBuddy("openaiApiKey", () => openaiMock);

      // Set up the success and failure callbacks
      const successCallback = jest.fn();
      const failureCallback = jest.fn();

      // Call completeComments with some sample arguments
      await devBuddy.completeComments(
        "selected text",
        "typescript",
        successCallback,
        failureCallback
      );

      // Verify that the failure callback was called with the expected error message
      expect(failureCallback).toHaveBeenCalledWith("test error");

      // Verify that the success callback was not called
      expect(successCallback).not.toHaveBeenCalled();

      // Verify that the OpenAI API client was called with the expected parameters
      expect(openaiMock.createCompletion).toHaveBeenCalledWith({
        model: "text-davinci-003",
        prompt:
          'Replace all the "TODO" and "FIXME" comments from the following code\nfor the code that actually does what the comment expects\nand remove the entire comment after the "TODO" or "FIXME":\n```typescript\nselected text\n```',
        temperature: 0.7,
        max_tokens: 256,
        top_p: 1,
        frequency_penalty: 0,
        presence_penalty: 0,
      });
    });
  });
});

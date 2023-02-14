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

  describe("completeComments", () => {
    const mockCompletionResponse = {
      data: {
        choices: [
          {
            text: "A completed code snippet"
          }
        ]
      }
    };

    const mockCreateCompletion = jest.fn().mockResolvedValue(mockCompletionResponse);
    const mockOpenai = { createCompletion: mockCreateCompletion };
    const mockConfigureOpenAI = jest.fn().mockReturnValue(mockOpenai);

    beforeEach(() => {
      jest.clearAllMocks();
    });

    it("should return the original 'selectedText' when the OpenAI API response is empty", async () => {
      const devBuddy = new DevBuddy("openai-api-key", mockConfigureOpenAI);
      mockCreateCompletion.mockResolvedValueOnce({
        data: {
          choices: [
            {
              text: ""
            }
          ]
        }
      });

      const result = await devBuddy.completeComments("Some code with TODO and FIXME comments", "javascript");

      expect(result).toBe("Some code with TODO and FIXME comments");
      expect(mockCreateCompletion).toHaveBeenCalledTimes(1);
    });

    it("should return the original 'selectedText' when the OpenAI API response is whitespace", async () => {
      const devBuddy = new DevBuddy("openai-api-key", mockConfigureOpenAI);
      mockCreateCompletion.mockResolvedValueOnce({
        data: {
          choices: [
            {
              text: "  \n\n   \n"
            }
          ]
        }
      });

      const result = await devBuddy.completeComments("Some code with TODO and FIXME comments", "javascript");

      expect(result).toBe("Some code with TODO and FIXME comments");
      expect(mockCreateCompletion).toHaveBeenCalledTimes(1);
    });

    it("should throw an error when an error occurs while calling the OpenAI API", async () => {
      const devBuddy = new DevBuddy("openai-api-key", mockConfigureOpenAI);
      mockCreateCompletion.mockRejectedValueOnce(new Error("API Error"));

      try {
        await devBuddy.completeComments("Some code with TODO and FIXME comments", "javascript");
        fail("Expected an error to be thrown");
      } catch (error: any) {
        expect(error.message).toBe("API Error");
        expect(mockCreateCompletion).toHaveBeenCalledTimes(1);
      }
    });
  });

});

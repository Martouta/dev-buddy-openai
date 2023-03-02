/* eslint-disable @typescript-eslint/naming-convention */
import { DevBuddy } from "../dev-buddy";
import { OpenAIApi } from "openai";

describe("DevBuddy", () => {
  describe(".configureOpenAI", () => {
    it("returns an instance of OpenAIApi", () => {
      const openai = DevBuddy.configureOpenAI('example-api-key');
      expect(openai).toBeInstanceOf(OpenAIApi);
    });
  });

  describe(".newText", () => {
    it("should return the response text when it does not start with '```' or end with '```' or '```\n'", () => {
      const completion = { data: { choices: [{ message: { content: "some completed text" } }] } };

      const newText = DevBuddy.newText(completion);

      expect(newText).toBe("some completed text");
    });

    it("returns the substring with the code when the response text starts with '```' and ends with '```'", () => {
      const completion = { data: { choices: [{ message: { content: "```ruby\ndef example\nend\n```" } }] } };
      const expectedNewText = "def example\nend";

      const newText = DevBuddy.newText(completion);

      expect(newText).toBe(expectedNewText);
    });

    it("returns the substringwith the code when the response text starts with '```' and ends with '```\n'", () => {
      const completion = { data: { choices: [{ message: { content: "```ruby\ndef example\nend\n```\n" } }] } };
      const expectedNewText = "def example\nend";

      const newText = DevBuddy.newText(completion);

      expect(newText).toBe(expectedNewText);
    });

    it("returns the response with trim", () => {
      const completion = { data: { choices: [{ message: { content: "\n\n\n   example    \n\t  \n" } }] } };
      const expectedNewText = "example";

      const newText = DevBuddy.newText(completion);

      expect(newText).toBe(expectedNewText);
    });
  });

  describe('.requestTextWithLanguageId', function () {
    it('returns the text to be sent to the server for the code snippet', () => {
      let selectedText = "lambda { |num| num * 2 }";
      let languageId = "ruby";
      expect(DevBuddy.requestTextWithLanguageId(selectedText, languageId)).toEqual(`\`\`\`${languageId}\n${selectedText}\n\`\`\``);
    });
  });

  describe(".requestBody", () => {
    it("returns an object with the expected properties", () => {
      const requestText = "```ruby\nlambda { |num| num * 2 }\n```";
      const requestBody = DevBuddy.requestBody(requestText);

      expect(requestBody).toHaveProperty("model");
      expect(requestBody).toHaveProperty("messages");

      expect(requestBody.model).toEqual("gpt-3.5-turbo");

      const expectedMessages = [
        {
          role: "system", content: [
            "You receive code and respond with the same code",
            "replacing all the 'TODO' and 'FIXME' comments",
            "for the code that actually does what the comment expects.",
            "The comments should also be removed after the 'TODO' or 'FIXME'."
          ].join(" ")
        },
        { role: "user", content: requestText }
      ];

      expect(requestBody.messages).toEqual(expectedMessages);
    });
  });

  describe("#completeComments", () => {
    const mockCompletionResponse = {
      data: {
        choices: [
          {
            message: {
              content: "```typescript\nfunction addNumbers(a: number, b: number): number {\n  return a + b;\n}\n```"
            }
          }
        ]
      }
    };

    const mockCreateCompletion = jest.fn().mockResolvedValue(mockCompletionResponse);
    const mockOpenai = { createChatCompletion: mockCreateCompletion };
    const mockConfigureOpenAI = jest.fn().mockReturnValue(mockOpenai);

    beforeEach(() => {
      jest.clearAllMocks();
    });

    it("completes the comments in the given code", async () => {
      const openaiApiKey = "your-api-key-here";
      const devBuddy = new DevBuddy(openaiApiKey, mockConfigureOpenAI);

      const selectedText = `function addNumbers(a: number, b: number): number {
        // TODO: Implement this function
      }`;

      const expectedText = "function addNumbers(a: number, b: number): number {\n  return a + b;\n}";

      const newText = await devBuddy.completeComments(selectedText, "typescript");

      expect(newText).toEqual(expectedText);
    });

    it("throws an error when an error occurs while calling the OpenAI API", async () => {
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

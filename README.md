# dev-buddy-openai

A VSCode extension that uses OpenAI's language generation capabilities to complete comments in your code.

## Getting started

1. Clone this repository
2. Open the folder in VSCode
3. Open the integrated terminal and run `npm install` to install the dependencies
4. Run the command `npm run watch` to compile the code and start the extension
5. Open a .ts file in VSCode and try running the `Dev Buddy OpenAI -> Complete Comments` command

## Configuration

In order to use this extension, you need to have an OpenAI API key. You can get one by signing up on the [OpenAI website](https://beta.openai.com/signup/). Once you have an API key, you need to set it as an environment variable. On Windows, you can do this by opening the Start menu, searching for "Environment Variables" and clicking on "Edit the system environment variables". On Mac, you can do this by opening a terminal and running the following command:

```bash
export OPENAI_API_KEY=<your api key>
```


Replace `<your api key>` with your actual API key.

## Usage

To complete a comment, select the text you want to use as the prompt and run the `Dev Buddy OpenAI -> Complete Comments` command. The extension will use OpenAI's text generation capabilities to generate a continuation of your comment, which will then be inserted into the code.

## Contributing

Contributions are welcome. Please open an issue or a pull request if you want to help.

## License

This project is licensed under the MIT License.

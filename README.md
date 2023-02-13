# Dev-Buddy-OpenAI

A VSCode extension that uses OpenAI's code generation capabilities to complete/fix code from comments in your selected code.

## Installation

1. Open VS Code and click on the Extensions icon in the left sidebar
2. Search for "Dev-Buddy-OpenAI" in the Extensions Marketplace
3. Click on the Install button

## Configuration

In order to use this extension, you need to have an OpenAI API key. You can get one by signing up on the [OpenAI website](https://beta.openai.com/signup/). Once you have an API key, you need to set it as an environment variable. On Windows, you can do this by opening the Start menu, searching for "Environment Variables" and clicking on "Edit the system environment variables". On Mac/Linux, you can do this by opening a terminal and running the following command:

```bash
export OPENAI_API_KEY=<your api key>
```

Replace `<your api key>` with your actual API key.

## Usage

1. Select the code in your VSCode editor that contains `TODO:` and/or `FIXME:`. It's assuming the programming language of the file selected in VS Code to be correct.
2. Open the Command Palette (press `Ctrl + Shift + P` or `Cmd + Shift + P` on Mac).
3. Type "Dev Buddy OpenAI -> Complete Comments" and select the command from the list.
4. Wait for the response and the code will be replaced in your editor completing the code with what you requested in all your comments that start with `TODO:` or `FIXME:`.

## Contributing

Contributions are welcome. Please open an issue or a pull request if you want to help.
I recommend openning an issue first, and if there is already an issue, assign it to yourself to prevent doing work that someone else is already assigned for or that just won't be merged for whatever reason.

## License

This project is licensed under the MIT License.

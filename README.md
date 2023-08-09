# Mark generated files in VS Code

Warns whenever a file that's considered to be generated (externally) is opened or edited.

## Features

A file can be considered generated whenever it's URI matches a pattern (`/generated/` by default) or its first line includes a marker (`This file is generated` by default).

Such files are rendered as greyed out (think when a variable is reported as unnecessary) to retain the semantic tokens.
Moreover, editing the file will trigger a warning to help remind the user that the file is generated and thus it may be overwritten at some point.

## Extension Settings

This extension contributes the following settings:

- `generatedSourceWarning.generatedFileUriPattern`: RegExp file URI pattern for generated files to warn against.
- `generatedSourceWarning.generatedMarker`: First line marker that indicates whether to warn against a file.

## Building and installing locally

```script
$ npm install
$ npm run package

# ... and install the extension manually using the resulting .vsix file
```

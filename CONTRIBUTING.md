# Contributing to Our Project

We love your input! We want to make contributing to this project as easy and transparent as possible, whether it's:

- Reporting a bug
- Discussing the current state of the code
- Submitting a fix
- Proposing new features
- Becoming a maintainer

## We Develop with GitHub

We use GitHub to host code, to track issues and feature requests, as well as accept pull requests. For the prompt:

- Use the present tense ("add feature" not "added feature").
- Use the imperative mood ("move cursor to..." not "moves cursor to...").
- Do not capitalize the first letter of the subject line.
- Do not add a period at the end of the subject line.

The commit message should be structured as follows:

```
<type>[optional scope]: <description>

[optional body]

[optional footer(s)]
```

Example

```
feat: allow provided config object to extend other configs

BREAKING CHANGE: `extends` key in config file is now used for extending other config files
```

Types

- `feat`: A new feature.
- `fix`: A bug fix.
- `docs`: Documentation only changes.
- `style`: Changes that do not affect the meaning of the code (white-space, formatting, missing semi-colons, etc).
- `refactor`: A code change that neither fixes a bug nor adds a feature.
- `perf`: A code change that improves performance.
- `test`: Adding missing tests or correcting existing tests.
- `build`: Changes that affect the build system or external dependencies (example scopes: gulp, broccoli, npm).
- `ci`: Changes to our CI configuration files and scripts (example scopes: Travis, Circle, BrowserStack, SauceLabs).
- `chore`: Other changes that don't modify `src` or `test` files.
- `revert`: Reverts a previous commit.

## Pull requests

A good PR description helps your teammates understand the changes you've made and why. Please be as descriptive as possible.

```
### Summary

A brief explanation of the changes in this pull request.

### Changes

- A detailed, bulleted list of the changes made.
- Include screenshots or GIFs if you've made UI changes.

### Testing

- How were these changes tested?
- Are there any new tests?
- Are there any existing tests that need to be updated?

### Related Issues

- Link to any related issues.
```

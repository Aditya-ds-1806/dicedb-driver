# Contributing to DiceDB Driver

Thank you for considering contributing to DiceDB Driver! 🚀

Your help is appreciated, whether it's fixing bugs, improving documentation, adding new features, or providing suggestions.

## Table of Contents

- [Getting Started](#getting-started)
- [How to Contribute](#how-to-contribute)
- [Coding Guidelines](#coding-guidelines)
- [Submitting a Pull Request](#submitting-a-pull-request)
- [Reporting Issues](#reporting-issues)
- [License](#license)

---

## Getting Started

1. Fork the repository and clone it locally.
2. Install [protobuf compiler](https://protobuf.dev/installation/).
3. Install dependencies with `npm i`.
4. Run tests to ensure everything works: `npm test`.

## How To Contribute

- 💡 Propose Features – Open an issue describing your idea.
- 🐞 Fix Bugs – Check the issues labeled bug.
- 📝 Improve Docs – Spotted a typo or confusing explanation? Fix it!
  🔧 Add Commands – DiceDB supports many commands. Feel free to implement one if it’s missing.

## Coding Guidelines

- Stick to modern JavaScript (ES6+).
- Use [`utils/Logger.ts`](./utils/Logger.ts) for internal logging.
- Follow existing naming conventions and style.
- Write tests for new functionality.
- Keep your PRs focused and small.
- Document public methods where necessary.

## Submitting a Pull Request

1. Fork and clone the repo.
2. Create a new branch: `git checkout -b feat/my-feature-name`
3. Make your changes and commit: `git commit -m "Add feature XYZ"`
4. Push to your fork: `git push origin feature/my-feature-name`
5. Open a Pull Request with a clear title and description.

## Reporting Issues

If you encounter a bug or unexpected behavior, please:

- Search existing issues to avoid duplicates.
- Open a new issue with:
  - What you expected to happen
  - What actually happened
  - Steps to reproduce
  - Environment (Node.js version, OS, etc.)

## License

By contributing, you agree that your contributions will be licensed under the same license as the repository (MIT).

---

Thanks again for being awesome! 🙌

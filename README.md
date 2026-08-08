# automation-exercise

> Enterprise Playwright framework with **optional AI-assisted locator recovery**

## What it does

- **AI-assisted locators** (optional): Recover broken selectors via local AI (dev) or Claude API (CI/CD)
- **Hybrid testing**: API + UI automation in one framework
- **Enterprise-ready**: Page Object Model, CI/CD, HTML reporting, Docker support
- **Flexible**: Works standalone OR with AI enhancement

## Install

```bash
npm install automation-exercise
```

## Quick start

```bash
# Run all tests (no AI required)
npx playwright test

# Run with AI enhancement (local Ollama or Claude API)
npx playwright test --grep @ai-healing
```

## AI Enhancement (Optional)

**Local development** (free, offline):
- Requires: Ollama + Llama 3.2

**CI/CD** (scalable):
- Requires: Claude API key
- Runs in GitHub Actions, scales easily

See [PLAN.md](./PLAN.md) for setup instructions.

## Stack

- Playwright + TypeScript
- Optional: Ollama (local) or Claude API
- GitHub Actions (CI/CD)
- Page Object Model

---

Built by [@solcala](https://github.com/solcala)

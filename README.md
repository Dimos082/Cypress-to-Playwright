# Submission Notes: Cypress RealWorld App - Cypress auth.spec -> Playwright

## 1) Environment prerequisites

- Use the Node.js version specified in `.node-version`.
- Use **Yarn Classic (v1)**.
  - The project is **not compatible with Yarn Modern (v2+)**.
  - Repository uses Yarn Classic and documents `yarn dev` / `yarn cypress:open`.

## 2) Install dependencies and run the app locally

```bash
cd cypress-realworld-app
yarn
```

If the dev server fails with:
`[plugin:vite:import-analysis] Failed to resolve import "@mui/icons-material"...`

Workaround used in my environment:
```bash
yarn add @mui/icons-material
```

Start the app:
```bash
yarn dev
```

Default ports:
- Frontend: http://localhost:3000
- Backend:  http://localhost:3001

## 3) Run the original Cypress auth tests (baseline)

Open Cypress UI runner:
```bash
yarn cypress:open
```

Run the single spec headlessly:
```bash
yarn cypress:run --spec "cypress/tests/ui/auth.spec.ts"
```

## 4) Add Playwright to the repo (Windows / VS Code)

Install Playwright (initializer) into the existing repo:
```bash
yarn create playwright
```

During prompts I selected:
- TypeScript
- Tests folder: `playwright/tests`
- Install browsers: Yes

If browsers were not installed during init:
```bash
yarn playwright install
```

## 5) Playwright configuration

Key config choices:
- `baseURL = http://localhost:3000`
- `webServer` starts `yarn dev` (and reuses an existing server if already running)
- `testIdAttribute = "data-test"` because this app’s tests and helpers rely on `data-test` selectors.

## 6) Files added

### `playwright/tests/auth.spec.ts`
Port of `cypress/tests/ui/auth.spec.ts` with functionally equivalent coverage:
- redirect unauthenticated user to `/signin`
- redirect home after login
- “remember me” cookie behavior
- sign-up + login + onboarding (create bank account) + logout
- validation errors on login/signup forms
- invalid user / invalid password errors

### `playwright/pages/auth.page.ts`
Page Object Model for auth + onboarding:
- Centralizes locators/actions (signin/signup/onboarding/bank form).
- Uses stable `data-test` / test-id locators.

### `playwright/fixtures.ts`
Custom Playwright fixtures:
- Provides `auth.login()` / `auth.logout()` helpers shared across tests.

### `playwright/helpers.ts`
Small utilities:
- selector helpers (`getByTestId` input patterns, `data-test` contains selector)
- GraphQL operation matcher used to wait for `CreateBankAccount`.

## 7) Run Playwright tests

Headless run:
```bash
yarn playwright test
```

UI mode:
```bash
yarn playwright test --ui

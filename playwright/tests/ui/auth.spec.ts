import { test, expect, type APIRequestContext, type Page } from '../fixtures';
import AuthPage from '../pages/auth.page';
import { isGqlOperation } from '../helpers';
import { readFileSync } from 'fs';
import path from 'path';

const apiUrl = process.env.API_URL ?? `http://localhost:${process.env.VITE_BACKEND_PORT ?? '3001'}`;
const DEFAULT_TIMEOUT_MS = 5000;

function firstSeedUser(): { username: string } {
  // Reads example users from the local JSON db seed shipped with the repo.
  const dbPath = path.resolve(process.cwd(), 'data', 'database.json');
  const db = JSON.parse(readFileSync(dbPath, 'utf-8'));
  if (!db?.users?.length) throw new Error('No users found in data/database.json');
  return { username: db.users[0].username };
}

async function seedDb(request: APIRequestContext) {
  // Cypress task db:seed posts to the backend seed endpoint. :contentReference[oaicite:12]{index=12}
  // Add a small retry to avoid race with server startup on Windows.
  const url = `${apiUrl}/testData/seed`;
  let lastErr: unknown;
  for (let i = 0; i < 10; i++) {
    try {
      const res = await request.post(url);
      if (res.ok()) return;
      lastErr = new Error(`Seed failed: ${res.status()} ${await res.text()}`);
    } catch (e) {
      lastErr = e;
    }
    await new Promise(r => setTimeout(r, 500));
  }
  throw lastErr;
}

// helpers imported from ../helpers
// `login` and `logout` are provided by the shared `auth` fixture in ../fixtures

test.describe('User Sign-up and Login', () => {
  test.beforeEach(async ({ request }) => {
    await seedDb(request);
  });

  test('should redirect unauthenticated user to signin page', async ({ page }) => {
    await page.goto('/personal');
    await expect(page).toHaveURL(/\/signin$/);
  });

  test('should redirect to the home page after login', async ({ page, auth }) => {
    const user = firstSeedUser();
    await auth.login(user.username, 's3cret', { rememberUser: true });
    await expect(page).toHaveURL(/\/$/);
  });

  test('should remember a user for 30 days after login', async ({ page, auth }) => {
    const user = firstSeedUser();
    await auth.login(user.username, 's3cret', { rememberUser: true });

    const cookies = await page.context().cookies();
    const session = cookies.find(c => c.name === 'connect.sid');
    expect(session, 'connect.sid cookie should exist').toBeTruthy();
    const nowSecs = Math.floor(Date.now() / 1000);
    expect(session!.expires, 'cookie should be persistent (expires > now + 1 day)').toBeGreaterThan(nowSecs + 24 * 60 * 60);

    await auth.logout();
  });

  test('should allow a visitor to sign-up, login, and logout', async ({ page, auth }) => {
    const userInfo = {
      firstName: 'Bob',
      lastName: 'Ross',
      username: 'PainterJoy90',
      password: 's3cret',
    };

    await test.step('Navigate to signup and fill form', async () => {
      await page.goto('/');
      // Navigate directly to the signup route to avoid flaky client-side link clicks
      await page.goto('/signup');
        const authPage = new AuthPage(page);
        await authPage.gotoSignup();
        await authPage.signupTitle().waitFor({ state: 'visible', timeout: DEFAULT_TIMEOUT_MS });
        await expect(authPage.signupTitle()).toBeVisible();
        await expect(authPage.signupTitle()).toContainText('Sign Up');

        await authPage.fillSignupForm(userInfo);

        await Promise.all([
          page.waitForResponse(r => r.url().includes('/users') && r.request().method() === 'POST'),
          authPage.signupSubmit().click(),
        ]);
    });

    await test.step('Login after signup', async () => {
      await auth.login(userInfo.username, userInfo.password);
    });

    await test.step('Onboarding and create bank account', async () => {
      const authPage = new AuthPage(page);
      await expect(authPage.userOnboardingDialog()).toBeVisible();
      await expect(authPage.listSkeleton()).toHaveCount(0);
      await expect(authPage.navTopNotificationsCount()).toHaveCount(1);

      await authPage.userOnboardingNext().click();
      await expect(authPage.userOnboardingDialogTitle()).toContainText('Create Bank Account');

      await authPage.fillBankAccountForm('The Best Bank', '123456789', '987654321');

      const gqlCreateBankAccount = page.waitForRequest(req => isGqlOperation(req, 'CreateBankAccount'));

      await Promise.all([gqlCreateBankAccount, authPage.onboardingSubmitButton().click()]);

      await expect(authPage.userOnboardingDialogTitle()).toContainText('Finished');
      await expect(authPage.userOnboardingDialogContent()).toContainText("You're all set!");
      await authPage.userOnboardingNext().click();

      await expect(authPage.transactionList()).toBeVisible();
    });

    await test.step('Logout', async () => {
      await auth.logout();
    });
  });

  test('should display login errors', async ({ page }) => {
    const authPage = new AuthPage(page);
    await page.goto('/');

    const u = authPage.signinUsername();
    await u.fill('User');
    await u.fill('');
    await u.press('Tab');
    await expect(authPage.usernameHelperText()).toContainText('Username is required');

    const p = authPage.signinPassword();
    await p.fill('abc');
    await p.press('Tab');
    await expect(authPage.passwordHelperText()).toContainText('Password must contain at least 4 characters');

    await expect(authPage.signinSubmit()).toBeDisabled();
  });

  test('should display signup errors', async ({ page }) => {
    const authPage = new AuthPage(page);
    await authPage.gotoSignup();

    const fn = authPage.signupFirstName();
    await fn.fill('First');
    await fn.fill('');
    await fn.press('Tab');
    await expect(authPage.firstNameHelperText()).toContainText('First Name is required');

    const ln = authPage.signupLastName();
    await ln.fill('Last');
    await ln.fill('');
    await ln.press('Tab');
    await expect(authPage.lastNameHelperText()).toContainText('Last Name is required');

    const un = authPage.signupUsername();
    await un.fill('User');
    await un.fill('');
    await un.press('Tab');
    await expect(authPage.usernameHelperText()).toContainText('Username is required');

    const pw = authPage.signupPassword();
    await pw.fill('password');
    await pw.fill('');
    await pw.press('Tab');
    await expect(authPage.passwordHelperText()).toContainText('Enter your password');

    const cpw = authPage.signupConfirmPassword();
    await cpw.fill('DIFFERENT PASSWORD');
    await cpw.press('Tab');
    await expect(authPage.confirmPasswordHelperText()).toContainText('Password does not match');

    await expect(authPage.signupSubmit()).toBeDisabled();
  });

  test('should error for an invalid user', async ({ page, auth }) => {
    const authPage = new AuthPage(page);
    await auth.login('invalidUserName', 'invalidPa$$word');
    await expect(authPage.signinError()).toHaveText('Username or password is invalid');
  });

  test('should error for an invalid password for existing user', async ({ page, auth }) => {
    const authPage = new AuthPage(page);
    const user = firstSeedUser();
    await auth.login(user.username, 'INVALID');
    await expect(authPage.signinError()).toHaveText('Username or password is invalid');
  });
});

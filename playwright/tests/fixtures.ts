import { test as base, expect, type APIRequestContext, type Page } from '@playwright/test';
import { readFileSync } from 'fs';
import path from 'path';
import AuthPage from './pages/auth.page';

const DEFAULT_TIMEOUT_MS = 5000;

export const test = base.extend<{ auth: { login: (username: string, password: string, opts?: { rememberUser?: boolean }) => Promise<void>; logout: () => Promise<void> } }>({
  auth: async ({ page }, use) => {
    const login = async (username: string, password: string, opts?: { rememberUser?: boolean }) => {
      const authPage = new AuthPage(page);
      await page.goto('/signin');

      await authPage.signinUsername().fill(username);
      await authPage.signinPassword().fill(password);

      if (opts?.rememberUser) {
        await authPage.signinRemember().check();
      }

      await Promise.all([
        page.waitForResponse(r => r.url().includes('/login') && r.request().method() === 'POST'),
        authPage.signinSubmit().click(),
      ]);
    };

    const logout = async () => {
      const toggle = page.getByTestId('sidenav-toggle');
      const signout = page.getByTestId('sidenav-signout');

      if (!(await signout.isVisible())) {
        if (await toggle.isVisible()) {
          await toggle.click();
          try {
            await signout.waitFor({ state: 'visible', timeout: DEFAULT_TIMEOUT_MS });
          } catch (e) {
            console.warn('sidenav-signout did not become visible after toggle', e);
          }
        } else {
          const userMenu = page.getByTestId('user-menu');
          if (await userMenu.isVisible()) {
            await userMenu.click();
            try {
              await signout.waitFor({ state: 'visible', timeout: DEFAULT_TIMEOUT_MS });
            } catch (e) {
              console.warn('sidenav-signout did not become visible after opening user menu', e);
            }
          }
        }
      }

      await signout.click();
      await expect(page).toHaveURL(/\/signin$/);
    };

    await use({ login, logout });
  },
});

export { expect, APIRequestContext, Page };

import { Page } from '@playwright/test';

export class AuthPage {
  readonly page: Page;

  constructor(page: Page) {
    this.page = page;
  }

  // Sign in locators
  signinUsername() {
    return this.page.getByTestId('signin-username').locator('input');
  }

  signinPassword() {
    return this.page.getByTestId('signin-password').locator('input');
  }

  signinRemember() {
    return this.page.getByTestId('signin-remember-me').locator('input');
  }

  signinSubmit() {
    return this.page.getByTestId('signin-submit');
  }

  // Signup locators / actions
  async gotoSignup() {
    await this.page.goto('/signup');
  }

  signupTitle() {
    return this.page.getByTestId('signup-title');
  }

  signupFirstName() {
    return this.page.getByTestId('signup-first-name').locator('input');
  }

  signupLastName() {
    return this.page.getByTestId('signup-last-name').locator('input');
  }

  signupUsername() {
    return this.page.getByTestId('signup-username').locator('input');
  }

  signupPassword() {
    return this.page.getByTestId('signup-password').locator('input');
  }

  signupConfirmPassword() {
    return this.page.getByTestId('signup-confirmPassword').locator('input');
  }

  signupSubmit() {
    return this.page.getByTestId('signup-submit');
  }

  async fillSignupForm(user: { firstName: string; lastName: string; username: string; password: string }) {
    await this.signupFirstName().fill(user.firstName);
    await this.signupLastName().fill(user.lastName);
    await this.signupUsername().fill(user.username);
    await this.signupPassword().fill(user.password);
    await this.signupConfirmPassword().fill(user.password);
  }

  // Onboarding locators used by tests
  userOnboardingDialog() {
    return this.page.getByTestId('user-onboarding-dialog');
  }

  userOnboardingNext() {
    return this.page.getByTestId('user-onboarding-next');
  }

  userOnboardingDialogTitle() {
    return this.page.getByTestId('user-onboarding-dialog-title');
  }

  userOnboardingDialogContent() {
    return this.page.getByTestId('user-onboarding-dialog-content');
  }

  transactionList() {
    return this.page.getByTestId('transaction-list');
  }

  // Validation error text locators
  usernameHelperText() {
    return this.page.locator('#username-helper-text');
  }

  passwordHelperText() {
    return this.page.locator('#password-helper-text');
  }

  firstNameHelperText() {
    return this.page.locator('#firstName-helper-text');
  }

  lastNameHelperText() {
    return this.page.locator('#lastName-helper-text');
  }

  confirmPasswordHelperText() {
    return this.page.locator('#confirmPassword-helper-text');
  }

  // Bank account form during onboarding
  bankNameInput() {
    return this.page.locator('[data-test*="bankName-input"] input');
  }

  accountNumberInput() {
    return this.page.locator('[data-test*="accountNumber-input"] input');
  }

  routingNumberInput() {
    return this.page.locator('[data-test*="routingNumber-input"] input');
  }

  async fillBankAccountForm(bankName: string, accountNumber: string, routingNumber: string) {
    await this.bankNameInput().fill(bankName);
    await this.accountNumberInput().fill(accountNumber);
    await this.routingNumberInput().fill(routingNumber);
  }

  // Other onboarding UI
  listSkeleton() {
    return this.page.getByTestId('list-skeleton');
  }

  navTopNotificationsCount() {
    return this.page.getByTestId('nav-top-notifications-count');
  }

  onboardingSubmitButton() {
    return this.page.locator('[data-test*="submit"]');
  }

  signinError() {
    return this.page.getByTestId('signin-error');
  }
}

export default AuthPage;

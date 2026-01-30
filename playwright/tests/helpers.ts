import { Page } from '@playwright/test';

export function inputById(page: Page, id: string) {
  return page.getByTestId(id).locator('input');
}

export function bySelLike(page: Page, fragment: string) {
  return page.locator(`[data-test*="${fragment}"]`);
}

export function isGqlOperation(req: { url: () => string; method: () => string; postData?: () => string | null } | any, operationName: string) {
  try {
    if (!req.url || !req.method) return false;
    if (!req.url().includes('/graphql') || req.method() !== 'POST') return false;
    const post = req.postData?.();
    if (!post) return false;
    try {
      const body = JSON.parse(post);
      return body.operationName === operationName;
    } catch {
      return post.includes(operationName);
    }
  } catch (e) {
    console.warn('isGqlOperation check failed', e);
    return false;
  }
}

export default { inputById, bySelLike, isGqlOperation };

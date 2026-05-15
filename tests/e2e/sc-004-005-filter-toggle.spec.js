// SC-004: 할일 필터링 조회 / SC-005: 할일 완료 처리
import { test, expect } from '@playwright/test';
import { uniqueEmail, BASE } from './helpers.js';

test.describe('SC-004/005: 할일 필터링 및 완료 토글', () => {
  test.beforeEach(async ({ page }) => {
    const email = uniqueEmail('sc004');
    await page.goto(`${BASE}/register`);
    await page.getByLabel('이름').fill('김지수');
    await page.getByLabel('이메일').fill(email);
    await page.getByLabel('비밀번호').first().fill('ITLead2024');
    await page.getByRole('button', { name: '회원가입' }).click();
    await page.waitForURL(`${BASE}/todos`);

    for (const title of ['업무 할일', '개인 할일']) {
      await page.getByRole('link', { name: '+ 새 할일' }).click();
      await page.waitForURL(`${BASE}/todos/new`);
      await page.getByLabel('제목').fill(title);
      await page.locator('select[required]').selectOption({ label: '일반' });
      await page.getByLabel('종료 예정일').fill('2026-12-31');
      await page.getByRole('button', { name: '등록' }).click();
      await page.waitForURL(`${BASE}/todos`);
    }
    // Wait for both todos to fully render (stale cache may show only the first todo briefly)
    await expect(page.getByText('업무 할일')).toBeVisible();
    await expect(page.getByText('개인 할일')).toBeVisible();
  });

  test('SC-004: 전체 필터에서 등록한 할일이 모두 보인다', async ({ page }) => {
    await expect(page.getByText('업무 할일')).toBeVisible();
    await expect(page.getByText('개인 할일')).toBeVisible();
  });

  test('SC-005: 체크박스 클릭으로 완료 상태가 변경된다', async ({ page }) => {
    const firstCheckbox = page.locator('input[type="checkbox"]').first();
    await expect(firstCheckbox).not.toBeChecked();

    await Promise.all([
      page.waitForResponse(resp => resp.url().includes('/done') && resp.request().method() === 'PATCH'),
      firstCheckbox.click(),
    ]);
    await page.waitForResponse(resp => resp.url().includes('/todos') && !resp.url().includes('/done') && resp.request().method() === 'GET');

    await expect(firstCheckbox).toBeChecked();
  });

  test('SC-005: 완료 토글 후 미완료 필터에서 사라진다', async ({ page }) => {
    const firstCheckbox = page.locator('input[type="checkbox"]').first();
    await Promise.all([
      page.waitForResponse(resp => resp.url().includes('/done') && resp.request().method() === 'PATCH'),
      firstCheckbox.click(),
    ]);
    await page.waitForTimeout(300);

    await page.getByRole('button', { name: '미완료' }).click();
    await page.waitForTimeout(300);

    const items = page.locator('ul li');
    await expect(items).toHaveCount(1);
  });

  test('SC-005: 완료 → 재클릭하면 미완료로 복원된다', async ({ page }) => {
    const firstCheckbox = page.locator('input[type="checkbox"]').first();

    await Promise.all([
      page.waitForResponse(resp => resp.url().includes('/done') && resp.request().method() === 'PATCH'),
      firstCheckbox.click(),
    ]);
    await page.waitForResponse(resp => resp.url().includes('/todos') && !resp.url().includes('/done') && resp.request().method() === 'GET');
    await expect(firstCheckbox).toBeChecked();

    await Promise.all([
      page.waitForResponse(resp => resp.url().includes('/done') && resp.request().method() === 'PATCH'),
      firstCheckbox.click(),
    ]);
    await page.waitForResponse(resp => resp.url().includes('/todos') && !resp.url().includes('/done') && resp.request().method() === 'GET');
    await expect(firstCheckbox).not.toBeChecked();
  });
});

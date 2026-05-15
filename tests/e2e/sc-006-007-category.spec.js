// SC-006: 카테고리 추가 / SC-007: 카테고리 삭제
import { test, expect } from '@playwright/test';
import { uniqueEmail, BASE, goToCategories, goToTodos, goToNewTodo } from './helpers.js';

test.describe('SC-006: 카테고리 추가 및 할일 재분류', () => {
  test.beforeEach(async ({ page }) => {
    const email = uniqueEmail('sc006');
    await page.goto(`${BASE}/register`);
    await page.getByLabel('이름').fill('이민호');
    await page.getByLabel('이메일').fill(email);
    await page.getByLabel('비밀번호').first().fill('Designer2024');
    await page.getByRole('button', { name: '회원가입' }).click();
    await page.waitForURL(`${BASE}/todos`);
  });

  test('새 카테고리 추가 후 목록에 표시된다', async ({ page }) => {
    await goToCategories(page);
    await page.getByPlaceholder('카테고리 이름').fill('클라이언트D');
    await page.getByRole('button', { name: '추가' }).click();
    await page.waitForTimeout(500);

    await expect(page.getByText('클라이언트D')).toBeVisible();
  });

  test('새 카테고리로 할일 등록이 가능하다', async ({ page }) => {
    await goToCategories(page);
    await page.getByPlaceholder('카테고리 이름').fill('신규카테고리');
    await page.getByRole('button', { name: '추가' }).click();
    await page.waitForTimeout(500);

    await goToTodos(page);
    await goToNewTodo(page);
    await page.getByLabel('제목').fill('신규 카테고리 할일');
    await page.locator('select[required]').selectOption({ label: '신규카테고리' });
    await page.getByLabel('종료 예정일').fill('2026-12-31');
    await page.getByRole('button', { name: '등록' }).click();
    await page.waitForURL(`${BASE}/todos`);

    await expect(page.getByText('신규 카테고리 할일')).toBeVisible();
  });

  test('카테고리 이름 수정이 가능하다', async ({ page }) => {
    await goToCategories(page);
    await page.getByPlaceholder('카테고리 이름').fill('수정전카테고리');
    await page.getByRole('button', { name: '추가' }).click();
    await page.waitForTimeout(500);

    await page.getByRole('button', { name: '수정' }).last().click();
    const nameInput = page.locator('input:not([type])').last();
    await nameInput.clear();
    await nameInput.fill('수정후카테고리');
    await page.getByRole('button', { name: '저장' }).click();
    await page.waitForTimeout(500);

    await expect(page.getByText('수정후카테고리')).toBeVisible();
  });
});

test.describe('SC-007: 카테고리 삭제', () => {
  test.beforeEach(async ({ page }) => {
    const email = uniqueEmail('sc007');
    await page.goto(`${BASE}/register`);
    await page.getByLabel('이름').fill('김지수');
    await page.getByLabel('이메일').fill(email);
    await page.getByLabel('비밀번호').first().fill('ITLead2024');
    await page.getByRole('button', { name: '회원가입' }).click();
    await page.waitForURL(`${BASE}/todos`);
  });

  test('기본 카테고리(일반/업무/개인) 3개가 생성된다', async ({ page }) => {
    await goToCategories(page);
    const defaultBadges = page.locator('span').filter({ hasText: '기본' });
    await expect(defaultBadges).toHaveCount(3);
  });

  test('커스텀 카테고리 삭제 후 목록에서 사라진다', async ({ page }) => {
    await goToCategories(page);
    await page.getByPlaceholder('카테고리 이름').fill('삭제용카테고리');
    await page.getByRole('button', { name: '추가' }).click();
    await page.waitForTimeout(500);

    await expect(page.getByText('삭제용카테고리')).toBeVisible();

    page.on('dialog', async (dialog) => {
      await dialog.accept();
    });

    await page.getByRole('button', { name: '삭제' }).last().click();
    await page.waitForTimeout(500);

    await expect(page.getByText('삭제용카테고리')).not.toBeVisible();
  });
});

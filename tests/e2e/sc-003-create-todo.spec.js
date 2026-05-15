// SC-003: 새 할일 등록
import { test, expect } from '@playwright/test';
import { uniqueEmail, BASE, goToNewTodo } from './helpers.js';

test.describe('SC-003: 새 할일 등록', () => {
  test.beforeEach(async ({ page }) => {
    const email = uniqueEmail('sc003');
    await page.goto(`${BASE}/register`);
    await page.getByLabel('이름').fill('이민호');
    await page.getByLabel('이메일').fill(email);
    await page.getByLabel('비밀번호').first().fill('Designer2024');
    await page.getByRole('button', { name: '회원가입' }).click();
    await page.waitForURL(`${BASE}/todos`);
  });

  test('할일 등록 후 목록에 표시된다', async ({ page }) => {
    await goToNewTodo(page);

    await page.getByLabel('제목').fill('클라이언트C 웹사이트 리디자인');
    await page.getByLabel('설명').fill('UI 프로토타입 작업');
    await page.locator('select[required]').selectOption({ label: '일반' });
    await page.getByLabel('종료 예정일').fill('2026-12-31');

    await page.getByRole('button', { name: '등록' }).click();
    await page.waitForURL(`${BASE}/todos`);

    await expect(page.getByText('클라이언트C 웹사이트 리디자인')).toBeVisible();
  });

  test('AF-001: 제목 미입력 시 에러가 표시된다', async ({ page }) => {
    await goToNewTodo(page);
    await page.locator('select[required]').selectOption({ label: '일반' });
    await page.getByLabel('종료 예정일').fill('2026-12-31');
    await page.getByRole('button', { name: '등록' }).click();

    await expect(page.getByText('제목을 입력해주세요.')).toBeVisible();
  });

  test('AF-001: 카테고리 미선택 시 에러가 표시된다', async ({ page }) => {
    await goToNewTodo(page);
    await page.getByLabel('제목').fill('테스트 할일');
    await page.getByLabel('종료 예정일').fill('2026-12-31');
    await page.getByRole('button', { name: '등록' }).click();

    await expect(page.getByText('카테고리를 선택해주세요.')).toBeVisible();
  });

  test('AF-001: 종료 예정일 미입력 시 에러가 표시된다', async ({ page }) => {
    await goToNewTodo(page);
    await page.getByLabel('제목').fill('테스트 할일');
    await page.locator('select[required]').selectOption({ label: '일반' });
    await page.getByRole('button', { name: '등록' }).click();

    await expect(page.getByText('종료 예정일을 입력해주세요.')).toBeVisible();
  });
});

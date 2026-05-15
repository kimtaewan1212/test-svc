// SC-002: 로그인 및 오늘 할일 확인
import { test, expect } from '@playwright/test';
import { uniqueEmail, BASE } from './helpers.js';

test.describe('SC-002: 로그인 및 할일 목록 확인', () => {
  test('정상 로그인 후 /todos로 리다이렉트되고 할일 목록이 표시된다', async ({ page }) => {
    const email = uniqueEmail('sc002');
    const password = 'DevTeamLead2024';

    await page.goto(`${BASE}/register`);
    await page.getByLabel('이름').fill('김지수');
    await page.getByLabel('이메일').fill(email);
    await page.getByLabel('비밀번호').first().fill(password);
    await page.getByRole('button', { name: '회원가입' }).click();
    await page.waitForURL(`${BASE}/todos`);

    await page.goto(`${BASE}/login`);
    await page.getByLabel('이메일').fill(email);
    await page.getByLabel('비밀번호').fill(password);
    await page.getByRole('button', { name: '로그인' }).click();

    await page.waitForURL(`${BASE}/todos`);
    await expect(page).toHaveURL(`${BASE}/todos`);
    await expect(page.getByRole('heading', { name: '할일 목록' })).toBeVisible();
  });

  test('AF-001: 틀린 비밀번호로 로그인 시 에러 메시지가 표시된다', async ({ page }) => {
    const email = uniqueEmail('sc002err');

    await page.goto(`${BASE}/register`);
    await page.getByLabel('이름').fill('테스트');
    await page.getByLabel('이메일').fill(email);
    await page.getByLabel('비밀번호').first().fill('Correct1234');
    await page.getByRole('button', { name: '회원가입' }).click();
    await page.waitForURL(`${BASE}/todos`);

    await page.goto(`${BASE}/login`);
    await page.getByLabel('이메일').fill(email);
    await page.getByLabel('비밀번호').fill('WrongPass1');
    await page.getByRole('button', { name: '로그인' }).click();

    await expect(page.getByText('이메일 또는 비밀번호가 올바르지 않습니다.')).toBeVisible();
  });

  test('비로그인 상태에서 /todos 접근 시 /login 으로 리다이렉트된다', async ({ page }) => {
    await page.goto(`${BASE}/todos`);
    await expect(page).toHaveURL(`${BASE}/login`);
  });
});

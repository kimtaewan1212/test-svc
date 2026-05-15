// SC-001: 신규 사용자 회원가입
import { test, expect } from '@playwright/test';
import { uniqueEmail, BASE } from './helpers.js';

test.describe('SC-001: 신규 사용자 회원가입', () => {
  test('정상 회원가입 후 /todos로 리다이렉트된다', async ({ page }) => {
    const email = uniqueEmail('sc001');
    await page.goto(`${BASE}/register`);

    await page.getByLabel('이름').fill('박서연');
    await page.getByLabel('이메일').fill(email);
    await page.getByLabel('비밀번호').first().fill('Marketing2024');
    await page.getByRole('button', { name: '회원가입' }).click();

    await page.waitForURL(`${BASE}/todos`);
    await expect(page).toHaveURL(`${BASE}/todos`);
  });

  test('로그인 페이지에서 회원가입 링크로 이동 가능하다', async ({ page }) => {
    await page.goto(`${BASE}/login`);
    await page.getByRole('link', { name: '회원가입' }).click();
    await expect(page).toHaveURL(`${BASE}/register`);
  });

  test('AF-001: 잘못된 이메일 형식 입력 시 에러 메시지가 표시된다', async ({ page }) => {
    await page.goto(`${BASE}/register`);
    await page.getByLabel('이름').fill('테스트');
    await page.getByLabel('이메일').fill('invalid@nodot');
    await page.getByLabel('비밀번호').first().fill('Valid1234');
    await page.getByRole('button', { name: '회원가입' }).click();

    await expect(page.getByText('올바른 이메일 형식이 아닙니다.')).toBeVisible();
  });

  test('AF-002: 중복 이메일 가입 시 에러 메시지가 표시된다', async ({ page }) => {
    const email = uniqueEmail('sc001dup');

    await page.goto(`${BASE}/register`);
    await page.getByLabel('이름').fill('박서연');
    await page.getByLabel('이메일').fill(email);
    await page.getByLabel('비밀번호').first().fill('Marketing2024');
    await page.getByRole('button', { name: '회원가입' }).click();
    await page.waitForURL(`${BASE}/todos`);

    await page.goto(`${BASE}/register`);
    await page.getByLabel('이름').fill('박서연2');
    await page.getByLabel('이메일').fill(email);
    await page.getByLabel('비밀번호').first().fill('Marketing2024');
    await page.getByRole('button', { name: '회원가입' }).click();

    await expect(page.getByText('이미 사용 중인 이메일입니다.')).toBeVisible();
  });

  test('AF-003: 약한 비밀번호 입력 시 에러 메시지가 표시된다', async ({ page }) => {
    await page.goto(`${BASE}/register`);
    await page.getByLabel('이름').fill('테스트');
    await page.getByLabel('이메일').fill(uniqueEmail('sc001pw'));
    await page.getByLabel('비밀번호').first().fill('weak');
    await page.getByRole('button', { name: '회원가입' }).click();

    await expect(page.getByText('비밀번호는 8자 이상, 영문과 숫자를 포함해야 합니다.')).toBeVisible();
  });
});

// SC-008: 비밀번호 변경 / SC-009: 회원탈퇴
import { test, expect } from '@playwright/test';
import { uniqueEmail, BASE, goToSettings } from './helpers.js';

test.describe('SC-008: 비밀번호 변경 및 이름 수정', () => {
  const password = 'Marketing2024';
  let email;

  test.beforeEach(async ({ page }) => {
    email = uniqueEmail('sc008');
    await page.goto(`${BASE}/register`);
    await page.getByLabel('이름').fill('박서연');
    await page.getByLabel('이메일').fill(email);
    await page.getByLabel('비밀번호').first().fill(password);
    await page.getByRole('button', { name: '회원가입' }).click();
    await page.waitForURL(`${BASE}/todos`);
  });

  test('비밀번호 변경 성공 후 성공 메시지가 표시된다', async ({ page }) => {
    await goToSettings(page);
    await page.getByPlaceholder('현재 비밀번호').fill(password);
    await page.getByPlaceholder('새 비밀번호 (8자 이상, 영문+숫자)').fill('NewPassword2026');
    await page.getByRole('button', { name: '저장' }).nth(1).click();

    await expect(page.getByText('비밀번호가 변경되었습니다.')).toBeVisible();
  });

  test('AF-001: 현재 비밀번호 오류 시 에러 메시지가 표시된다', async ({ page }) => {
    await goToSettings(page);
    await page.getByPlaceholder('현재 비밀번호').fill('WrongPass1');
    await page.getByPlaceholder('새 비밀번호 (8자 이상, 영문+숫자)').fill('NewPassword2026');
    await page.getByRole('button', { name: '저장' }).nth(1).click();

    await expect(page.getByText('이메일 또는 비밀번호가 올바르지 않습니다.')).toBeVisible();
  });

  test('AF-003: 약한 새 비밀번호 입력 시 에러 메시지가 표시된다', async ({ page }) => {
    await goToSettings(page);
    await page.getByPlaceholder('현재 비밀번호').fill(password);
    await page.getByPlaceholder('새 비밀번호 (8자 이상, 영문+숫자)').fill('weak');
    await page.getByRole('button', { name: '저장' }).nth(1).click();

    await expect(page.getByText('새 비밀번호는 8자 이상, 영문과 숫자를 포함해야 합니다.')).toBeVisible();
  });

  test('이름 변경 성공 후 성공 메시지가 표시된다', async ({ page }) => {
    await goToSettings(page);
    const nameInput = page.getByRole('textbox').first();
    await nameInput.clear();
    await nameInput.fill('박서연 (수정)');
    await page.getByRole('button', { name: '저장' }).first().click();

    await expect(page.getByText('이름이 변경되었습니다.')).toBeVisible();
  });
});

test.describe('SC-009: 회원 탈퇴', () => {
  test('회원탈퇴 후 로그인 페이지로 이동한다', async ({ page }) => {
    const email = uniqueEmail('sc009');
    await page.goto(`${BASE}/register`);
    await page.getByLabel('이름').fill('이민호');
    await page.getByLabel('이메일').fill(email);
    await page.getByLabel('비밀번호').first().fill('Freelance2024');
    await page.getByRole('button', { name: '회원가입' }).click();
    await page.waitForURL(`${BASE}/todos`);

    await goToSettings(page);

    page.on('dialog', async (dialog) => {
      await dialog.accept();
    });

    await page.getByRole('button', { name: '회원탈퇴' }).click();
    await page.waitForURL(`${BASE}/login`);
    await expect(page).toHaveURL(`${BASE}/login`);
  });

  test('AF-002: confirm 취소 시 탈퇴가 진행되지 않는다', async ({ page }) => {
    const email = uniqueEmail('sc009cancel');
    await page.goto(`${BASE}/register`);
    await page.getByLabel('이름').fill('이민호');
    await page.getByLabel('이메일').fill(email);
    await page.getByLabel('비밀번호').first().fill('Freelance2024');
    await page.getByRole('button', { name: '회원가입' }).click();
    await page.waitForURL(`${BASE}/todos`);

    await goToSettings(page);

    page.on('dialog', async (dialog) => {
      await dialog.dismiss();
    });

    await page.getByRole('button', { name: '회원탈퇴' }).click();
    await page.waitForTimeout(500);
    await expect(page).toHaveURL(`${BASE}/settings`);
  });
});

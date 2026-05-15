export const BASE = 'http://localhost:5173';

export async function registerAndLogin(page, { name, email, password }) {
  await page.goto(`${BASE}/register`);
  await page.getByLabel('이름').fill(name);
  await page.getByLabel('이메일').fill(email);
  await page.getByLabel('비밀번호').first().fill(password);
  await page.getByRole('button', { name: '회원가입' }).click();
  await page.waitForURL(`${BASE}/todos`);
}

export function uniqueEmail(prefix = 'e2e') {
  return `${prefix}_${Date.now()}@test.com`;
}

export async function goToNewTodo(page) {
  await page.getByRole('link', { name: '+ 새 할일' }).click();
  await page.waitForURL(`${BASE}/todos/new`);
}

export async function goToCategories(page) {
  await page.getByRole('link', { name: '카테고리 관리' }).first().click();
  await page.waitForURL(`${BASE}/categories`);
}

export async function goToSettings(page) {
  await page.getByRole('link', { name: '설정' }).first().click();
  await page.waitForURL(`${BASE}/settings`);
}

export async function goToTodos(page) {
  await page.getByRole('link', { name: '할일 목록' }).first().click();
  await page.waitForURL(`${BASE}/todos`);
}

'use strict';

require('dotenv').config({ path: '.env.test' });

const request = require('supertest');
const { Pool } = require('pg');
const { resetDb } = require('../helpers/resetDb');

let app, pool, accessToken, categoryId;

beforeAll(async () => {
  pool = new Pool({
    host: process.env.DB_HOST, port: Number(process.env.DB_PORT),
    database: process.env.DB_NAME, user: process.env.DB_USER, password: process.env.DB_PASSWORD,
  });
  app = require('../../src/index');
});

beforeEach(async () => {
  await resetDb(pool);
  const res = await request(app).post('/api/v1/auth/register')
    .send({ email: 'todo@test.com', password: 'pass1234', name: '홍길동' });
  accessToken = res.body.accessToken;

  const cats = await request(app).get('/api/v1/categories')
    .set('Authorization', `Bearer ${accessToken}`);
  categoryId = cats.body[0].id;
});

afterAll(async () => { await pool.end(); });

const createTodo = (title, dueDate = '2026-12-31') =>
  request(app).post('/api/v1/todos')
    .set('Authorization', `Bearer ${accessToken}`)
    .send({ title, categoryId, dueDate });

describe('할일 CRUD 흐름', () => {
  it('할일 등록 후 목록에서 조회된다', async () => {
    await createTodo('테스트 할일');
    const res = await request(app).get('/api/v1/todos')
      .set('Authorization', `Bearer ${accessToken}`);

    expect(res.status).toBe(200);
    expect(res.body.data.some(t => t.title === '테스트 할일')).toBe(true);
  });

  it('페이지네이션 응답 형식이 올바르다', async () => {
    await createTodo('할일1');
    await createTodo('할일2');
    const res = await request(app).get('/api/v1/todos?page=1&limit=1')
      .set('Authorization', `Bearer ${accessToken}`);

    expect(res.body.pagination).toMatchObject({ page: 1, limit: 1, total: 2, totalPages: 2 });
  });

  it('완료 필터가 동작한다', async () => {
    const todo = await createTodo('완료 할일');
    await request(app).patch(`/api/v1/todos/${todo.body.id}/done`)
      .set('Authorization', `Bearer ${accessToken}`);

    const doneRes = await request(app).get('/api/v1/todos?status=done')
      .set('Authorization', `Bearer ${accessToken}`);
    const undoneRes = await request(app).get('/api/v1/todos?status=undone')
      .set('Authorization', `Bearer ${accessToken}`);

    expect(doneRes.body.data).toHaveLength(1);
    expect(undoneRes.body.data).toHaveLength(0);
  });

  it('완료 토글이 동작한다', async () => {
    const todo = await createTodo('토글 할일');
    expect(todo.body.isCompleted).toBe(false);

    const toggled = await request(app).patch(`/api/v1/todos/${todo.body.id}/done`)
      .set('Authorization', `Bearer ${accessToken}`);
    expect(toggled.body.isCompleted).toBe(true);

    const restored = await request(app).patch(`/api/v1/todos/${todo.body.id}/done`)
      .set('Authorization', `Bearer ${accessToken}`);
    expect(restored.body.isCompleted).toBe(false);
  });

  it('할일 삭제 후 목록에서 사라진다', async () => {
    const todo = await createTodo('삭제 할일');
    await request(app).delete(`/api/v1/todos/${todo.body.id}`)
      .set('Authorization', `Bearer ${accessToken}`);

    const res = await request(app).get('/api/v1/todos')
      .set('Authorization', `Bearer ${accessToken}`);
    expect(res.body.data.some(t => t.title === '삭제 할일')).toBe(false);
  });
});

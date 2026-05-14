'use strict';

require('dotenv').config({ path: '.env.test' });

const request = require('supertest');
const { Pool } = require('pg');
const { resetDb } = require('../helpers/resetDb');

let app, pool, accessToken, generalCategoryId;

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
    .send({ email: 'cat@test.com', password: 'pass1234', name: '홍길동' });
  accessToken = res.body.accessToken;

  const cats = await request(app).get('/api/v1/categories')
    .set('Authorization', `Bearer ${accessToken}`);
  generalCategoryId = cats.body.find(c => c.name === '일반').id;
});

afterAll(async () => { await pool.end(); });

describe('카테고리 CRUD 흐름', () => {
  it('카테고리 추가 후 목록에서 조회된다', async () => {
    await request(app).post('/api/v1/categories')
      .set('Authorization', `Bearer ${accessToken}`)
      .send({ name: '프로젝트', color: '#ff0000' });

    const res = await request(app).get('/api/v1/categories')
      .set('Authorization', `Bearer ${accessToken}`);

    expect(res.status).toBe(200);
    expect(res.body.some(c => c.name === '프로젝트')).toBe(true);
  });

  it('카테고리 수정이 반영된다', async () => {
    const create = await request(app).post('/api/v1/categories')
      .set('Authorization', `Bearer ${accessToken}`)
      .send({ name: '임시', color: '#000000' });

    const res = await request(app).patch(`/api/v1/categories/${create.body.id}`)
      .set('Authorization', `Bearer ${accessToken}`)
      .send({ name: '수정됨' });

    expect(res.status).toBe(200);
    expect(res.body.name).toBe('수정됨');
  });

  it('카테고리 삭제 시 소속 할일이 일반 카테고리로 이전된다', async () => {
    const cat = await request(app).post('/api/v1/categories')
      .set('Authorization', `Bearer ${accessToken}`)
      .send({ name: '삭제예정', color: '#aaaaaa' });

    await request(app).post('/api/v1/todos')
      .set('Authorization', `Bearer ${accessToken}`)
      .send({ title: '이전테스트', categoryId: cat.body.id, dueDate: '2026-12-31' });

    await request(app).delete(`/api/v1/categories/${cat.body.id}`)
      .set('Authorization', `Bearer ${accessToken}`);

    const { rows } = await pool.query("SELECT category_id FROM todos WHERE title = '이전테스트'");
    expect(rows[0].category_id).toBe(generalCategoryId);
  });

  it('기본 카테고리 삭제 시도 시 CAT_002를 반환한다', async () => {
    const res = await request(app).delete(`/api/v1/categories/${generalCategoryId}`)
      .set('Authorization', `Bearer ${accessToken}`);
    expect(res.status).toBe(400);
    expect(res.body.error.code).toBe('CAT_002');
  });
});

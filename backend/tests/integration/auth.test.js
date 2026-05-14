'use strict';

require('dotenv').config({ path: '.env.test' });

const request = require('supertest');
const { Pool } = require('pg');
const { resetDb } = require('../helpers/resetDb');

let app;
let pool;

beforeAll(async () => {
  pool = new Pool({
    host: process.env.DB_HOST,
    port: Number(process.env.DB_PORT),
    database: process.env.DB_NAME,
    user: process.env.DB_USER,
    password: process.env.DB_PASSWORD,
  });
  app = require('../../src/index');
});

beforeEach(async () => {
  await resetDb(pool);
});

afterAll(async () => {
  await pool.end();
});

describe('POST /api/v1/auth/register', () => {
  it('정상 가입 후 토큰과 사용자 정보를 반환한다', async () => {
    const res = await request(app)
      .post('/api/v1/auth/register')
      .send({ email: 'test@test.com', password: 'pass1234', name: '홍길동' });

    expect(res.status).toBe(201);
    expect(res.body).toHaveProperty('accessToken');
    expect(res.body).toHaveProperty('refreshToken');
    expect(res.body.user).toMatchObject({ email: 'test@test.com', name: '홍길동' });
    expect(res.body.user).not.toHaveProperty('password');
  });

  it('중복 이메일 가입 시 USER_001을 반환한다', async () => {
    await request(app).post('/api/v1/auth/register')
      .send({ email: 'dup@test.com', password: 'pass1234', name: '홍길동' });

    const res = await request(app).post('/api/v1/auth/register')
      .send({ email: 'dup@test.com', password: 'pass1234', name: '홍길동' });

    expect(res.status).toBe(409);
    expect(res.body.error.code).toBe('USER_001');
  });
});

describe('POST /api/v1/auth/login', () => {
  beforeEach(async () => {
    await request(app).post('/api/v1/auth/register')
      .send({ email: 'login@test.com', password: 'pass1234', name: '홍길동' });
  });

  it('정상 로그인 시 토큰을 반환한다', async () => {
    const res = await request(app).post('/api/v1/auth/login')
      .send({ email: 'login@test.com', password: 'pass1234' });

    expect(res.status).toBe(200);
    expect(res.body).toHaveProperty('accessToken');
  });

  it('틀린 비밀번호 시 USER_002를 반환한다', async () => {
    const res = await request(app).post('/api/v1/auth/login')
      .send({ email: 'login@test.com', password: 'wrong1234' });

    expect(res.status).toBe(401);
    expect(res.body.error.code).toBe('USER_002');
  });
});

describe('Access Token → API 호출 → Refresh → 로그아웃 흐름', () => {
  it('전체 인증 흐름이 성공한다', async () => {
    const reg = await request(app).post('/api/v1/auth/register')
      .send({ email: 'flow@test.com', password: 'pass1234', name: '홍길동' });

    const { accessToken, refreshToken } = reg.body;

    const meRes = await request(app).get('/api/v1/users/me')
      .set('Authorization', `Bearer ${accessToken}`);
    expect(meRes.status).toBe(200);

    const refreshRes = await request(app).post('/api/v1/auth/refresh')
      .send({ refreshToken });
    expect(refreshRes.status).toBe(200);
    expect(refreshRes.body).toHaveProperty('accessToken');

    const logoutRes = await request(app).post('/api/v1/auth/logout')
      .set('Authorization', `Bearer ${accessToken}`)
      .send({ refreshToken });
    expect(logoutRes.status).toBe(200);
  });
});

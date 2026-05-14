'use strict';

jest.mock('../../src/repositories/userRepository');
jest.mock('../../src/repositories/refreshTokenRepository');
jest.mock('../../src/repositories/categoryRepository');

const userRepo    = require('../../src/repositories/userRepository');
const tokenRepo   = require('../../src/repositories/refreshTokenRepository');
const categoryRepo = require('../../src/repositories/categoryRepository');
const authService = require('../../src/services/authService');

describe('authService', () => {
  beforeEach(() => jest.clearAllMocks());

  describe('register', () => {
    it('중복 이메일이면 USER_001 오류를 반환한다', async () => {
      userRepo.findByEmail.mockResolvedValue({ id: 1, email: 'dup@test.com' });
      await expect(authService.register('dup@test.com', 'pass1234', '홍길동'))
        .rejects.toMatchObject({ code: 'USER_001' });
    });

    it('가입 성공 시 기본 카테고리 3개 생성을 호출한다', async () => {
      userRepo.findByEmail.mockResolvedValue(null);
      userRepo.create.mockResolvedValue({ id: 1, email: 'new@test.com', name: '홍길동' });
      categoryRepo.create.mockResolvedValue({});
      tokenRepo.create.mockResolvedValue({});

      await authService.register('new@test.com', 'pass1234', '홍길동');
      expect(categoryRepo.create).toHaveBeenCalledTimes(3);
    });
  });

  describe('login', () => {
    it('존재하지 않는 이메일이면 USER_002 오류를 반환한다', async () => {
      userRepo.findByEmail.mockResolvedValue(null);
      await expect(authService.login('none@test.com', 'pass1234'))
        .rejects.toMatchObject({ code: 'USER_002' });
    });

    it('비밀번호 불일치 시 USER_002 오류를 반환한다', async () => {
      userRepo.findByEmail.mockResolvedValue({
        id: 1, email: 'user@test.com',
        // bcrypt hash of 'correct1234'
        password: '$2b$12$KIXjj6DNU/dMF4G7v0hLyOSgaLT5K9lRZvchEGh/QpELrMD6HAmcq',
      });
      await expect(authService.login('user@test.com', 'wrong1234'))
        .rejects.toMatchObject({ code: 'USER_002' });
    });
  });

  describe('refresh', () => {
    it('DB에 없는 토큰이면 AUTH_005 오류를 반환한다', async () => {
      tokenRepo.findByToken.mockResolvedValue(null);
      await expect(authService.refresh('invalid_token'))
        .rejects.toMatchObject({ code: 'AUTH_005' });
    });

    it('만료된 토큰이면 AUTH_005 오류를 반환한다', async () => {
      tokenRepo.findByToken.mockResolvedValue({
        token: 'old_token',
        expiresAt: new Date(Date.now() - 1000),
      });
      await expect(authService.refresh('old_token'))
        .rejects.toMatchObject({ code: 'AUTH_005' });
    });
  });
});

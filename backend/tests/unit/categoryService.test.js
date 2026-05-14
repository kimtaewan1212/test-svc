'use strict';

jest.mock('../../src/repositories/categoryRepository');
jest.mock('../../src/repositories/todoRepository');
jest.mock('../../src/config/db');

const categoryRepo   = require('../../src/repositories/categoryRepository');
const categoryService = require('../../src/services/categoryService');

describe('categoryService', () => {
  beforeEach(() => jest.clearAllMocks());

  describe('create', () => {
    it('카테고리가 20개 이상이면 CAT_003 오류를 반환한다', async () => {
      categoryRepo.countByUserId.mockResolvedValue(20);
      await expect(categoryService.create(1, '새카테고리', '#ffffff'))
        .rejects.toMatchObject({ code: 'CAT_003' });
    });
  });

  describe('update', () => {
    it('존재하지 않는 카테고리면 CAT_001 오류를 반환한다', async () => {
      categoryRepo.findById.mockResolvedValue(null);
      await expect(categoryService.update(1, 999, { name: '변경' }))
        .rejects.toMatchObject({ code: 'CAT_001' });
    });

    it('타인 카테고리 접근 시 AUTH_004 오류를 반환한다', async () => {
      categoryRepo.findById.mockResolvedValue({ id: 1, userId: 2, isDefault: false });
      await expect(categoryService.update(1, 1, { name: '변경' }))
        .rejects.toMatchObject({ code: 'AUTH_004' });
    });
  });

  describe('delete', () => {
    it('기본 카테고리 삭제 시도 시 CAT_002 오류를 반환한다', async () => {
      categoryRepo.findById.mockResolvedValue({ id: 1, userId: 1, isDefault: true });
      await expect(categoryService.delete(1, 1))
        .rejects.toMatchObject({ code: 'CAT_002' });
    });

    it('타인 카테고리 삭제 시도 시 AUTH_004 오류를 반환한다', async () => {
      categoryRepo.findById.mockResolvedValue({ id: 2, userId: 2, isDefault: false });
      await expect(categoryService.delete(1, 2))
        .rejects.toMatchObject({ code: 'AUTH_004' });
    });
  });
});

'use strict';

jest.mock('../../src/repositories/todoRepository');
jest.mock('../../src/repositories/categoryRepository');

const todoRepo    = require('../../src/repositories/todoRepository');
const categoryRepo = require('../../src/repositories/categoryRepository');
const todoService = require('../../src/services/todoService');

describe('todoService', () => {
  beforeEach(() => jest.clearAllMocks());

  describe('getAll', () => {
    it('유효하지 않은 status 파라미터 시 TODO_002 오류를 반환한다', async () => {
      await expect(todoService.getAll(1, { status: 'invalid' }))
        .rejects.toMatchObject({ code: 'TODO_002' });
    });

    it('유효하지 않은 period 파라미터 시 TODO_002 오류를 반환한다', async () => {
      await expect(todoService.getAll(1, { period: 'invalid' }))
        .rejects.toMatchObject({ code: 'TODO_002' });
    });

    it('limit이 100 초과이면 100으로 제한한다', async () => {
      todoRepo.findAllByUserId.mockResolvedValue([]);
      todoRepo.countByUserId.mockResolvedValue(0);

      await todoService.getAll(1, {}, { limit: '200', page: '1' });
      expect(todoRepo.findAllByUserId).toHaveBeenCalledWith(
        1, {}, expect.objectContaining({ limit: 100 })
      );
    });
  });

  describe('getById', () => {
    it('존재하지 않는 할일이면 TODO_001 오류를 반환한다', async () => {
      todoRepo.findById.mockResolvedValue(null);
      await expect(todoService.getById(1, 999))
        .rejects.toMatchObject({ code: 'TODO_001' });
    });

    it('타인 할일 접근 시 AUTH_004 오류를 반환한다', async () => {
      todoRepo.findById.mockResolvedValue({ id: 1, userId: 2 });
      await expect(todoService.getById(1, 1))
        .rejects.toMatchObject({ code: 'AUTH_004' });
    });
  });
});

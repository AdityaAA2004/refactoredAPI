import { UserService } from '../services/user.service.js';
import { IUserRepository } from '../contracts/user.repository.contract.js';
import { UserResponse } from '../types/user.types.js';
import { ListQueryParams } from '../lib/pagination.js';
import { ForbiddenError, NotFoundError, UnauthorizedError } from '../lib/errors.js';

const mockUser: UserResponse = {
  id: 42,
  email: 'user@test.com',
  name: 'Test User',
  bio: 'Test bio',
  createdAt: new Date('2026-01-01'),
  updatedAt: new Date('2026-01-01'),
};

const makeParams = (): ListQueryParams => ({
  page: 1,
  limit: 20,
  skip: 0,
  filters: {},
});

const makeRepo = (): jest.Mocked<IUserRepository> => ({
  findMany: jest.fn(),
  findById: jest.fn(),
  create: jest.fn(),
  update: jest.fn(),
  delete: jest.fn(),
  findAuthByLogin: jest.fn(),
});

describe('UserService', () => {
  let service: UserService;
  let repo: jest.Mocked<IUserRepository>;

  beforeEach(() => {
    repo = makeRepo();
    service = new UserService(repo);
  });

  describe('list', () => {
    it('delegates to repository.findMany', async () => {
      const params = makeParams();
      repo.findMany.mockResolvedValue({ data: [mockUser], total: 1 });

      const result = await service.list(params);

      expect(repo.findMany).toHaveBeenCalledWith(params);
      expect(result).toEqual({ data: [mockUser], total: 1 });
    });
  });

  describe('getById', () => {
    it('returns the record when found', async () => {
      repo.findById.mockResolvedValue(mockUser);

      const result = await service.getById(42);

      expect(result).toEqual(mockUser);
    });

    it('throws NotFoundError when record does not exist', async () => {
      repo.findById.mockResolvedValue(null);

      await expect(service.getById(99)).rejects.toThrow(NotFoundError);
    });
  });

  describe('create', () => {
    it('delegates to repository.create without FK injection', async () => {
      repo.create.mockResolvedValue(mockUser);

      const result = await service.create({
        email: 'user@test.com',
        name: 'Test User',
        password: 'secret',
      });

      expect(repo.create).toHaveBeenCalledWith(
        expect.objectContaining({ email: 'user@test.com', name: 'Test User' }),
      );
      expect(result).toEqual(mockUser);
    });
  });

  describe('update', () => {
    it('updates the record when actor is the user themselves', async () => {
      const updated = { ...mockUser, name: 'New Name' };
      repo.update.mockResolvedValue(updated);

      const result = await service.update(42, { name: 'New Name' }, 42);

      expect(repo.update).toHaveBeenCalledWith(42, { name: 'New Name' });
      expect(result).toEqual(updated);
    });

    it('throws ForbiddenError when actor tries to update a different user', async () => {
      await expect(service.update(42, { name: 'Hack' }, 99)).rejects.toThrow(ForbiddenError);
      expect(repo.update).not.toHaveBeenCalled();
    });

    it('throws NotFoundError when repository.update returns null', async () => {
      repo.update.mockResolvedValue(null);

      await expect(service.update(42, { name: 'New Name' }, 42)).rejects.toThrow(NotFoundError);
    });

    it('throws UnauthorizedError when actorId is absent', async () => {
      await expect(service.update(42, { name: 'New Name' })).rejects.toThrow(UnauthorizedError);
    });
  });

  describe('remove', () => {
    it('deletes the record when actor is the user themselves', async () => {
      repo.delete.mockResolvedValue(true);

      await expect(service.remove(42, 42)).resolves.toBeUndefined();
      expect(repo.delete).toHaveBeenCalledWith(42);
    });

    it('throws ForbiddenError when actor tries to delete a different user', async () => {
      await expect(service.remove(42, 99)).rejects.toThrow(ForbiddenError);
      expect(repo.delete).not.toHaveBeenCalled();
    });

    it('throws NotFoundError when repository.delete returns false', async () => {
      repo.delete.mockResolvedValue(false);

      await expect(service.remove(42, 42)).rejects.toThrow(NotFoundError);
    });

    it('throws UnauthorizedError when actorId is absent', async () => {
      await expect(service.remove(42)).rejects.toThrow(UnauthorizedError);
    });
  });
});

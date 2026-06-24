import { PostService } from '../services/post.service.js';
import { IPostRepository } from '../contracts/post.repository.contract.js';
import { PostResponse } from '../types/post.types.js';
import { ListQueryParams } from '../lib/pagination.js';
import { ForbiddenError, NotFoundError, UnauthorizedError } from '../lib/errors.js';

const mockPost: PostResponse = {
  id: 1,
  title: 'Test Post',
  content: 'Test Content',
  published: false,
  authorId: 42,
  createdAt: new Date('2026-01-01'),
  updatedAt: new Date('2026-01-01'),
};

const makeParams = (): ListQueryParams => ({
  page: 1,
  limit: 20,
  skip: 0,
  filters: {},
});

const makeRepo = (): jest.Mocked<IPostRepository> => ({
  findMany: jest.fn(),
  findById: jest.fn(),
  create: jest.fn(),
  update: jest.fn(),
  delete: jest.fn(),
  findManyByAuthorId: jest.fn(),
});

describe('PostService', () => {
  let service: PostService;
  let repo: jest.Mocked<IPostRepository>;

  beforeEach(() => {
    repo = makeRepo();
    service = new PostService(repo);
  });

  describe('list', () => {
    it('delegates to repository.findMany', async () => {
      const params = makeParams();
      repo.findMany.mockResolvedValue({ data: [mockPost], total: 1 });

      const result = await service.list(params);

      expect(repo.findMany).toHaveBeenCalledWith(params);
      expect(result).toEqual({ data: [mockPost], total: 1 });
    });
  });

  describe('getById', () => {
    it('returns the record when found', async () => {
      repo.findById.mockResolvedValue(mockPost);

      const result = await service.getById(1);

      expect(repo.findById).toHaveBeenCalledWith(1);
      expect(result).toEqual(mockPost);
    });

    it('throws NotFoundError when record does not exist', async () => {
      repo.findById.mockResolvedValue(null);

      await expect(service.getById(99)).rejects.toThrow(NotFoundError);
    });
  });

  describe('create', () => {
    it('injects actorId as authorId and delegates to repository.create', async () => {
      repo.create.mockResolvedValue(mockPost);

      const result = await service.create({ title: 'T', content: 'C' }, 42);

      expect(repo.create).toHaveBeenCalledWith(
        expect.objectContaining({ title: 'T', content: 'C', authorId: 42 }),
      );
      expect(result).toEqual(mockPost);
    });

    it('throws UnauthorizedError when actorId is absent', async () => {
      await expect(service.create({ title: 'T', content: 'C' })).rejects.toThrow(
        UnauthorizedError,
      );
    });
  });

  describe('update', () => {
    it('updates the record when actor owns it', async () => {
      const updated = { ...mockPost, title: 'New Title' };
      repo.findById.mockResolvedValue(mockPost);
      repo.update.mockResolvedValue(updated);

      const result = await service.update(1, { title: 'New Title' }, 42);

      expect(repo.update).toHaveBeenCalledWith(1, { title: 'New Title' });
      expect(result).toEqual(updated);
    });

    it('throws ForbiddenError when actor does not own the record', async () => {
      repo.findById.mockResolvedValue(mockPost);

      await expect(service.update(1, { title: 'New Title' }, 99)).rejects.toThrow(ForbiddenError);
      expect(repo.update).not.toHaveBeenCalled();
    });

    it('throws NotFoundError when repository.update returns null', async () => {
      repo.findById.mockResolvedValue(mockPost);
      repo.update.mockResolvedValue(null);

      await expect(service.update(1, { title: 'T' }, 42)).rejects.toThrow(NotFoundError);
    });

    it('throws UnauthorizedError when actorId is absent', async () => {
      repo.findById.mockResolvedValue(mockPost);

      await expect(service.update(1, { title: 'T' })).rejects.toThrow(UnauthorizedError);
    });
  });

  describe('remove', () => {
    it('deletes the record when actor owns it', async () => {
      repo.findById.mockResolvedValue(mockPost);
      repo.delete.mockResolvedValue(true);

      await expect(service.remove(1, 42)).resolves.toBeUndefined();
      expect(repo.delete).toHaveBeenCalledWith(1);
    });

    it('throws ForbiddenError when actor does not own the record', async () => {
      repo.findById.mockResolvedValue(mockPost);

      await expect(service.remove(1, 99)).rejects.toThrow(ForbiddenError);
      expect(repo.delete).not.toHaveBeenCalled();
    });

    it('throws NotFoundError when repository.delete returns false', async () => {
      repo.findById.mockResolvedValue(mockPost);
      repo.delete.mockResolvedValue(false);

      await expect(service.remove(1, 42)).rejects.toThrow(NotFoundError);
    });

    it('throws UnauthorizedError when actorId is absent', async () => {
      repo.findById.mockResolvedValue(mockPost);

      await expect(service.remove(1)).rejects.toThrow(UnauthorizedError);
    });
  });

  describe('listByAuthorId', () => {
    it('delegates to repository.findManyByAuthorId', async () => {
      const params = makeParams();
      repo.findManyByAuthorId.mockResolvedValue({ data: [mockPost], total: 1 });

      const result = await service.listByAuthorId(42, params);

      expect(repo.findManyByAuthorId).toHaveBeenCalledWith(42, params);
      expect(result).toEqual({ data: [mockPost], total: 1 });
    });
  });

  describe('createForUser', () => {
    it('uses parentId as authorId (not actorId)', async () => {
      repo.create.mockResolvedValue(mockPost);

      await service.createForUser(42, { title: 'T', content: 'C' }, 42);

      expect(repo.create).toHaveBeenCalledWith(
        expect.objectContaining({ authorId: 42 }),
      );
    });

    it('throws UnauthorizedError when actorId is absent', async () => {
      await expect(
        service.createForUser(42, { title: 'T', content: 'C' }),
      ).rejects.toThrow(UnauthorizedError);
    });
  });
});

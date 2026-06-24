import { CommentService } from '../services/comment.service.js';
import { ICommentRepository } from '../contracts/comment.repository.contract.js';
import { CommentResponse } from '../types/comment.types.js';
import { ListQueryParams } from '../lib/pagination.js';
import { ForbiddenError, NotFoundError, UnauthorizedError } from '../lib/errors.js';

const mockComment: CommentResponse = {
  id: 1,
  body: 'Test comment',
  authorId: 42,
  postId: 7,
  createdAt: new Date('2026-01-01'),
  updatedAt: new Date('2026-01-01'),
};

const makeParams = (): ListQueryParams => ({
  page: 1,
  limit: 20,
  skip: 0,
  filters: {},
});

const makeRepo = (): jest.Mocked<ICommentRepository> => ({
  findMany: jest.fn(),
  findById: jest.fn(),
  create: jest.fn(),
  update: jest.fn(),
  delete: jest.fn(),
  findManyByAuthorId: jest.fn(),
  findManyByPostId: jest.fn(),
});

describe('CommentService', () => {
  let service: CommentService;
  let repo: jest.Mocked<ICommentRepository>;

  beforeEach(() => {
    repo = makeRepo();
    service = new CommentService(repo);
  });

  describe('list', () => {
    it('delegates to repository.findMany', async () => {
      const params = makeParams();
      repo.findMany.mockResolvedValue({ data: [mockComment], total: 1 });

      const result = await service.list(params);

      expect(repo.findMany).toHaveBeenCalledWith(params);
      expect(result).toEqual({ data: [mockComment], total: 1 });
    });
  });

  describe('getById', () => {
    it('returns the record when found', async () => {
      repo.findById.mockResolvedValue(mockComment);

      const result = await service.getById(1);

      expect(result).toEqual(mockComment);
    });

    it('throws NotFoundError when record does not exist', async () => {
      repo.findById.mockResolvedValue(null);

      await expect(service.getById(99)).rejects.toThrow(NotFoundError);
    });
  });

  describe('create', () => {
    it('injects actorId as authorId', async () => {
      repo.create.mockResolvedValue(mockComment);

      await service.create({ body: 'Hi', postId: 7 }, 42);

      expect(repo.create).toHaveBeenCalledWith(
        expect.objectContaining({ body: 'Hi', postId: 7, authorId: 42 }),
      );
    });

    it('throws UnauthorizedError when actorId is absent', async () => {
      await expect(service.create({ body: 'Hi', postId: 7 })).rejects.toThrow(UnauthorizedError);
    });
  });

  describe('update', () => {
    it('updates the record when actor owns it', async () => {
      const updated = { ...mockComment, body: 'Edited' };
      repo.findById.mockResolvedValue(mockComment);
      repo.update.mockResolvedValue(updated);

      const result = await service.update(1, { body: 'Edited' }, 42);

      expect(repo.update).toHaveBeenCalledWith(1, { body: 'Edited' });
      expect(result).toEqual(updated);
    });

    it('throws ForbiddenError when actor does not own the record', async () => {
      repo.findById.mockResolvedValue(mockComment);

      await expect(service.update(1, { body: 'Edited' }, 99)).rejects.toThrow(ForbiddenError);
      expect(repo.update).not.toHaveBeenCalled();
    });

    it('throws NotFoundError when repository.update returns null', async () => {
      repo.findById.mockResolvedValue(mockComment);
      repo.update.mockResolvedValue(null);

      await expect(service.update(1, { body: 'Edited' }, 42)).rejects.toThrow(NotFoundError);
    });

    it('throws UnauthorizedError when actorId is absent', async () => {
      repo.findById.mockResolvedValue(mockComment);

      await expect(service.update(1, { body: 'Edited' })).rejects.toThrow(UnauthorizedError);
    });
  });

  describe('remove', () => {
    it('deletes the record when actor owns it', async () => {
      repo.findById.mockResolvedValue(mockComment);
      repo.delete.mockResolvedValue(true);

      await expect(service.remove(1, 42)).resolves.toBeUndefined();
    });

    it('throws ForbiddenError when actor does not own the record', async () => {
      repo.findById.mockResolvedValue(mockComment);

      await expect(service.remove(1, 99)).rejects.toThrow(ForbiddenError);
      expect(repo.delete).not.toHaveBeenCalled();
    });

    it('throws NotFoundError when repository.delete returns false', async () => {
      repo.findById.mockResolvedValue(mockComment);
      repo.delete.mockResolvedValue(false);

      await expect(service.remove(1, 42)).rejects.toThrow(NotFoundError);
    });
  });

  describe('listByAuthorId', () => {
    it('delegates to repository.findManyByAuthorId', async () => {
      const params = makeParams();
      repo.findManyByAuthorId.mockResolvedValue({ data: [mockComment], total: 1 });

      const result = await service.listByAuthorId(42, params);

      expect(repo.findManyByAuthorId).toHaveBeenCalledWith(42, params);
      expect(result).toEqual({ data: [mockComment], total: 1 });
    });
  });

  describe('listByPostId', () => {
    it('delegates to repository.findManyByPostId', async () => {
      const params = makeParams();
      repo.findManyByPostId.mockResolvedValue({ data: [mockComment], total: 1 });

      const result = await service.listByPostId(7, params);

      expect(repo.findManyByPostId).toHaveBeenCalledWith(7, params);
      expect(result).toEqual({ data: [mockComment], total: 1 });
    });
  });

  describe('createForPost', () => {
    it('injects parentId as postId and actorId as authorId', async () => {
      repo.create.mockResolvedValue(mockComment);

      await service.createForPost(7, { body: 'Hi', postId: 0 }, 42);

      expect(repo.create).toHaveBeenCalledWith(
        expect.objectContaining({ postId: 7, authorId: 42 }),
      );
    });

    it('throws UnauthorizedError when actorId is absent', async () => {
      await expect(service.createForPost(7, { body: 'Hi', postId: 0 })).rejects.toThrow(
        UnauthorizedError,
      );
    });
  });
});

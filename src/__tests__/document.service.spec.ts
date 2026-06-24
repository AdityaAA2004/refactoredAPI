import { DocumentService } from '../services/document.service.js';
import { IDocumentRepository } from '../contracts/document.repository.contract.js';
import { DocumentResponse } from '../types/document.types.js';
import { ListQueryParams } from '../lib/pagination.js';
import { NotFoundError } from '../lib/errors.js';

const mockDoc: DocumentResponse = {
  id: '550e8400-e29b-41d4-a716-446655440000',
  title: 'Test Doc',
  content: 'Test Content',
  createdAt: new Date('2026-01-01'),
};

const makeParams = (): ListQueryParams => ({
  page: 1,
  limit: 20,
  skip: 0,
  filters: {},
});

const makeRepo = (): jest.Mocked<IDocumentRepository> => ({
  findMany: jest.fn(),
  findById: jest.fn(),
  create: jest.fn(),
  update: jest.fn(),
  delete: jest.fn(),
});

describe('DocumentService', () => {
  let service: DocumentService;
  let repo: jest.Mocked<IDocumentRepository>;

  beforeEach(() => {
    repo = makeRepo();
    service = new DocumentService(repo);
  });

  describe('list', () => {
    it('delegates to repository.findMany', async () => {
      const params = makeParams();
      repo.findMany.mockResolvedValue({ data: [mockDoc], total: 1 });

      const result = await service.list(params);

      expect(repo.findMany).toHaveBeenCalledWith(params);
      expect(result).toEqual({ data: [mockDoc], total: 1 });
    });
  });

  describe('getById', () => {
    it('returns the record when found', async () => {
      repo.findById.mockResolvedValue(mockDoc);

      const result = await service.getById(mockDoc.id);

      expect(repo.findById).toHaveBeenCalledWith(mockDoc.id);
      expect(result).toEqual(mockDoc);
    });

    it('throws NotFoundError when record does not exist', async () => {
      repo.findById.mockResolvedValue(null);

      await expect(service.getById(mockDoc.id)).rejects.toThrow(NotFoundError);
    });
  });

  describe('create', () => {
    it('delegates to repository.create', async () => {
      repo.create.mockResolvedValue(mockDoc);

      const result = await service.create({ title: 'Test Doc', content: 'Test Content' });

      expect(repo.create).toHaveBeenCalledWith(
        expect.objectContaining({ title: 'Test Doc', content: 'Test Content' }),
      );
      expect(result).toEqual(mockDoc);
    });
  });

  describe('update', () => {
    it('returns the updated record', async () => {
      const updated = { ...mockDoc, title: 'Renamed' };
      repo.update.mockResolvedValue(updated);

      const result = await service.update(mockDoc.id, { title: 'Renamed' });

      expect(repo.update).toHaveBeenCalledWith(mockDoc.id, { title: 'Renamed' });
      expect(result).toEqual(updated);
    });

    it('throws NotFoundError when repository.update returns null', async () => {
      repo.update.mockResolvedValue(null);

      await expect(service.update(mockDoc.id, { title: 'Renamed' })).rejects.toThrow(
        NotFoundError,
      );
    });
  });

  describe('remove', () => {
    it('completes without error when record is deleted', async () => {
      repo.delete.mockResolvedValue(true);

      await expect(service.remove(mockDoc.id)).resolves.toBeUndefined();
      expect(repo.delete).toHaveBeenCalledWith(mockDoc.id);
    });

    it('throws NotFoundError when repository.delete returns false', async () => {
      repo.delete.mockResolvedValue(false);

      await expect(service.remove(mockDoc.id)).rejects.toThrow(NotFoundError);
    });
  });
});

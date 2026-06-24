import { ForbiddenError, NotFoundError, UnauthorizedError } from '../lib/errors.js';
import { ListQueryParams } from '../lib/pagination.js';
import { IDocumentRepository } from '../contracts/document.repository.contract.js';
import { IDocumentService } from '../contracts/document.service.contract.js';
import { DocumentCreateInput, DocumentPersistenceCreateInput, DocumentResponse, DocumentUpdateInput } from '../types/document.types.js';

export class DocumentService implements IDocumentService {
  constructor(private readonly repository: IDocumentRepository) {}

  async list(params: ListQueryParams): Promise<{ data: DocumentResponse[]; total: number }> {
    return this.repository.findMany(params);
  }

  async getById(id: string): Promise<DocumentResponse> {
    return this.requireRecord(id);
  }

  async create(data: DocumentCreateInput, actorId?: string | number): Promise<DocumentResponse> {
    const payload: DocumentPersistenceCreateInput = {
      ...data,
    };
    return this.repository.create(payload);
  }

  async update(
    id: string,
    data: DocumentUpdateInput,
    actorId?: string | number,
  ): Promise<DocumentResponse> {
    const record = await this.repository.update(id, data);
    if (!record) {
      throw new NotFoundError('Document', id);
    }
    return record;
  }

  async remove(id: string, actorId?: string | number): Promise<void> {
    const deleted = await this.repository.delete(id);
    if (!deleted) {
      throw new NotFoundError('Document', id);
    }
  }

  private async requireRecord(id: string): Promise<DocumentResponse> {
    const record = await this.repository.findById(id);
    if (!record) {
      throw new NotFoundError('Document', id);
    }
    return record;
  }

  private requireActorId(actorId?: string | number): string | number {
    if (actorId === undefined || actorId === null) {
      throw new UnauthorizedError('Authentication is required');
    }
    return actorId;
  }
}

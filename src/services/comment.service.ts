import { ForbiddenError, NotFoundError, UnauthorizedError } from '../lib/errors.js';
import { ListQueryParams } from '../lib/pagination.js';
import { ICommentRepository } from '../contracts/comment.repository.contract.js';
import { ICommentService } from '../contracts/comment.service.contract.js';
import { CommentCreateInput, CommentPersistenceCreateInput, CommentResponse, CommentUpdateInput } from '../types/comment.types.js';

export class CommentService implements ICommentService {
  constructor(private readonly repository: ICommentRepository) {}

  async list(params: ListQueryParams): Promise<{ data: CommentResponse[]; total: number }> {
    return this.repository.findMany(params);
  }

  async getById(id: number): Promise<CommentResponse> {
    return this.requireRecord(id);
  }

  async create(data: CommentCreateInput, actorId?: string | number): Promise<CommentResponse> {
    const payload: CommentPersistenceCreateInput = {
      ...data,
      authorId: this.requireActorId(actorId) as any,
    };
    return this.repository.create(payload);
  }

  async update(
    id: number,
    data: CommentUpdateInput,
    actorId?: string | number,
  ): Promise<CommentResponse> {
    const existing = await this.requireRecord(id);
    if (existing.authorId !== this.requireActorId(actorId)) {
      throw new ForbiddenError('You do not own this resource');
    }
    const record = await this.repository.update(id, data);
    if (!record) {
      throw new NotFoundError('Comment', id);
    }
    return record;
  }

  async remove(id: number, actorId?: string | number): Promise<void> {
    const existing = await this.requireRecord(id);
    if (existing.authorId !== this.requireActorId(actorId)) {
      throw new ForbiddenError('You do not own this resource');
    }
    const deleted = await this.repository.delete(id);
    if (!deleted) {
      throw new NotFoundError('Comment', id);
    }
  }

  async listByAuthorId(
    parentId: number,
    params: ListQueryParams,
  ): Promise<{ data: CommentResponse[]; total: number }> {
    return this.repository.findManyByAuthorId(parentId, params);
  }

  async listByPostId(
    parentId: number,
    params: ListQueryParams,
  ): Promise<{ data: CommentResponse[]; total: number }> {
    return this.repository.findManyByPostId(parentId, params);
  }

  async createForPost(
    parentId: number,
    data: CommentCreateInput,
    actorId?: string | number,
  ): Promise<CommentResponse> {
    const payload: CommentPersistenceCreateInput = {
      ...data,
      postId: parentId,
      authorId: this.requireActorId(actorId) as any,
    };
    return this.repository.create(payload);
  }

  private async requireRecord(id: number): Promise<CommentResponse> {
    const record = await this.repository.findById(id);
    if (!record) {
      throw new NotFoundError('Comment', id);
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

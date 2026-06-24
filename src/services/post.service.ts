import { ForbiddenError, NotFoundError, UnauthorizedError } from '../lib/errors.js';
import { ListQueryParams } from '../lib/pagination.js';
import { IPostRepository } from '../contracts/post.repository.contract.js';
import { IPostService } from '../contracts/post.service.contract.js';
import { PostCreateInput, PostPersistenceCreateInput, PostResponse, PostUpdateInput } from '../types/post.types.js';

export class PostService implements IPostService {
  constructor(private readonly repository: IPostRepository) {}

  async list(params: ListQueryParams): Promise<{ data: PostResponse[]; total: number }> {
    return this.repository.findMany(params);
  }

  async getById(id: number): Promise<PostResponse> {
    return this.requireRecord(id);
  }

  async create(data: PostCreateInput, actorId?: string | number): Promise<PostResponse> {
    const payload: PostPersistenceCreateInput = {
      ...data,
      authorId: this.requireActorId(actorId) as any,
    };
    return this.repository.create(payload);
  }

  async update(
    id: number,
    data: PostUpdateInput,
    actorId?: string | number,
  ): Promise<PostResponse> {
    const existing = await this.requireRecord(id);
    if (existing.authorId !== this.requireActorId(actorId)) {
      throw new ForbiddenError('You do not own this resource');
    }
    const record = await this.repository.update(id, data);
    if (!record) {
      throw new NotFoundError('Post', id);
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
      throw new NotFoundError('Post', id);
    }
  }

  async listByAuthorId(
    parentId: number,
    params: ListQueryParams,
  ): Promise<{ data: PostResponse[]; total: number }> {
    return this.repository.findManyByAuthorId(parentId, params);
  }

  async createForUser(
    parentId: number,
    data: PostCreateInput,
    actorId?: string | number,
  ): Promise<PostResponse> {
    this.requireActorId(actorId);
    const payload: PostPersistenceCreateInput = {
      ...data,
      authorId: parentId,
    };
    return this.repository.create(payload);
  }

  private async requireRecord(id: number): Promise<PostResponse> {
    const record = await this.repository.findById(id);
    if (!record) {
      throw new NotFoundError('Post', id);
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

import { ListQueryParams } from '../lib/pagination.js';
import { PostCreateInput, PostUpdateInput, PostPersistenceCreateInput, PostRecord, PostResponse } from '../types/post.types.js';

export interface IPostRepository {
  findMany(params: ListQueryParams): Promise<{ data: PostResponse[]; total: number }>;
  findById(id: number): Promise<PostResponse | null>;
  create(data: PostPersistenceCreateInput): Promise<PostResponse>;
  update(id: number, data: PostUpdateInput): Promise<PostResponse | null>;
  delete(id: number): Promise<boolean>;
  findManyByAuthorId(
    parentId: number,
    params: ListQueryParams,
  ): Promise<{ data: PostResponse[]; total: number }>;
}

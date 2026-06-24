import { ListQueryParams } from '../lib/pagination.js';
import { PostCreateInput, PostResponse, PostUpdateInput } from '../types/post.types.js';

export interface IPostService {
  list(params: ListQueryParams): Promise<{ data: PostResponse[]; total: number }>;
  getById(id: number): Promise<PostResponse>;
  create(data: PostCreateInput, actorId?: string | number): Promise<PostResponse>;
  update(id: number, data: PostUpdateInput, actorId?: string | number): Promise<PostResponse>;
  remove(id: number, actorId?: string | number): Promise<void>;
  listByAuthorId(
    parentId: number,
    params: ListQueryParams,
  ): Promise<{ data: PostResponse[]; total: number }>;
  createForUser(
    parentId: number,
    data: PostCreateInput,
    actorId?: string | number,
  ): Promise<PostResponse>;
}

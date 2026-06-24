import { ListQueryParams } from '../lib/pagination.js';
import { CommentCreateInput, CommentResponse, CommentUpdateInput } from '../types/comment.types.js';

export interface ICommentService {
  list(params: ListQueryParams): Promise<{ data: CommentResponse[]; total: number }>;
  getById(id: number): Promise<CommentResponse>;
  create(data: CommentCreateInput, actorId?: string | number): Promise<CommentResponse>;
  update(id: number, data: CommentUpdateInput, actorId?: string | number): Promise<CommentResponse>;
  remove(id: number, actorId?: string | number): Promise<void>;
  listByAuthorId(
    parentId: number,
    params: ListQueryParams,
  ): Promise<{ data: CommentResponse[]; total: number }>;
  listByPostId(
    parentId: number,
    params: ListQueryParams,
  ): Promise<{ data: CommentResponse[]; total: number }>;
  createForPost(
    parentId: number,
    data: CommentCreateInput,
    actorId?: string | number,
  ): Promise<CommentResponse>;
}

import { ListQueryParams } from '../lib/pagination.js';
import { CommentCreateInput, CommentUpdateInput, CommentPersistenceCreateInput, CommentRecord, CommentResponse } from '../types/comment.types.js';

export interface ICommentRepository {
  findMany(params: ListQueryParams): Promise<{ data: CommentResponse[]; total: number }>;
  findById(id: number): Promise<CommentResponse | null>;
  create(data: CommentPersistenceCreateInput): Promise<CommentResponse>;
  update(id: number, data: CommentUpdateInput): Promise<CommentResponse | null>;
  delete(id: number): Promise<boolean>;
  findManyByAuthorId(
    parentId: number,
    params: ListQueryParams,
  ): Promise<{ data: CommentResponse[]; total: number }>;
  findManyByPostId(
    parentId: number,
    params: ListQueryParams,
  ): Promise<{ data: CommentResponse[]; total: number }>;
}

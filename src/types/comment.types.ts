export interface CommentRecord {
  id: number;
  body: string;
  authorId: number;
  postId: number;
  createdAt: Date;
  updatedAt: Date;
}

export type CommentResponse = CommentRecord;

export interface CommentCreateInput {
  body: string;
  postId: number;
}

export type CommentUpdateInput = Partial<CommentCreateInput>;
export type CommentPersistenceCreateInput = CommentCreateInput & Partial<Pick<CommentRecord, 'authorId'>>;

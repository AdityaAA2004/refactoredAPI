export interface PostRecord {
  id: number;
  title: string;
  content: string;
  published: boolean;
  authorId: number;
  createdAt: Date;
  updatedAt: Date;
}

export type PostResponse = PostRecord;

export interface PostCreateInput {
  title: string;
  content: string;
  published?: boolean;
}

export type PostUpdateInput = Partial<PostCreateInput>;
export type PostPersistenceCreateInput = PostCreateInput & Partial<Pick<PostRecord, 'authorId'>>;

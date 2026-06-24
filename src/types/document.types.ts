export interface DocumentRecord {
  id: string;
  title: string;
  content: string;
  createdAt: Date;
}

export type DocumentResponse = DocumentRecord;

export interface DocumentCreateInput {
  title: string;
  content: string;
}

export type DocumentUpdateInput = Partial<DocumentCreateInput>;
export type DocumentPersistenceCreateInput = DocumentCreateInput;

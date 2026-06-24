import { ListQueryParams } from '../lib/pagination.js';
import { DocumentCreateInput, DocumentUpdateInput, DocumentPersistenceCreateInput, DocumentRecord, DocumentResponse } from '../types/document.types.js';

export interface IDocumentRepository {
  findMany(params: ListQueryParams): Promise<{ data: DocumentResponse[]; total: number }>;
  findById(id: string): Promise<DocumentResponse | null>;
  create(data: DocumentPersistenceCreateInput): Promise<DocumentResponse>;
  update(id: string, data: DocumentUpdateInput): Promise<DocumentResponse | null>;
  delete(id: string): Promise<boolean>;
}

import { ListQueryParams } from '../lib/pagination.js';
import { DocumentCreateInput, DocumentResponse, DocumentUpdateInput } from '../types/document.types.js';

export interface IDocumentService {
  list(params: ListQueryParams): Promise<{ data: DocumentResponse[]; total: number }>;
  getById(id: string): Promise<DocumentResponse>;
  create(data: DocumentCreateInput, actorId?: string | number): Promise<DocumentResponse>;
  update(id: string, data: DocumentUpdateInput, actorId?: string | number): Promise<DocumentResponse>;
  remove(id: string, actorId?: string | number): Promise<void>;
}

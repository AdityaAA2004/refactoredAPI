import { prisma } from '../lib/prisma.js';
import { ListQueryParams } from '../lib/pagination.js';
import { IDocumentRepository } from '../contracts/document.repository.contract.js';
import { DocumentPersistenceCreateInput, DocumentRecord, DocumentResponse, DocumentUpdateInput } from '../types/document.types.js';


export class DocumentRepository implements IDocumentRepository {
  async findMany(
    params: ListQueryParams,
  ): Promise<{ data: DocumentResponse[]; total: number }> {
    const where: any = {};
    if (params.filters['title'] !== undefined) {
      where['title'] = params.filters['title'];
    }
    if (params.filters['content'] !== undefined) {
      where['content'] = params.filters['content'];
    }
    const orderBy: any = params.sort
      ? { [params.sort.field]: params.sort.order }
      : { id: 'desc' };
    const [data, total] = await prisma.$transaction([
      prisma.document.findMany({
        where,
        skip: params.skip,
        take: params.limit,
        orderBy,
      }),
      prisma.document.count({ where }),
    ]);

    return { data, total };
  }

  async findById(id: string): Promise<DocumentResponse | null> {
    return prisma.document.findUnique({
      where: { id: id },
    });
  }

  async create(data: DocumentPersistenceCreateInput): Promise<DocumentResponse> {
    return prisma.document.create({
      // Cast to any: custom type name clashes with Prisma's checked variant; scalar FKs resolve correctly at runtime.
      data: data as any,
    });
  }

  async update(id: string, data: DocumentUpdateInput): Promise<DocumentResponse | null> {
    try {
      return await prisma.document.update({
        where: { id: id },
        // Cast to any: see create() comment above.
        data: data as any,
      });
    } catch (err: any) {
      if (err.code === 'P2025') return null;
      throw err;
    }
  }

  async delete(id: string): Promise<boolean> {
    try {
      await prisma.document.delete({
        where: { id: id },
      });
      return true;
    } catch (err: any) {
      if (err.code === 'P2025') return false;
      throw err;
    }
  }
}

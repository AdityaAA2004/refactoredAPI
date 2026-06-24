import { prisma } from '../lib/prisma.js';
import { ListQueryParams } from '../lib/pagination.js';
import { IUserRepository } from '../contracts/user.repository.contract.js';
import { UserPersistenceCreateInput, UserRecord, UserResponse, UserUpdateInput } from '../types/user.types.js';


export class UserRepository implements IUserRepository {
  // Sensitive fields are excluded from all read responses
  private readonly safeSelect = {
    id: true,
    email: true,
    name: true,
    password: false,
    bio: true,
    createdAt: true,
    updatedAt: true,
  } as const;

  async findMany(
    params: ListQueryParams,
  ): Promise<{ data: UserResponse[]; total: number }> {
    const where: any = {};
    if (params.filters['email'] !== undefined) {
      where['email'] = params.filters['email'];
    }
    if (params.filters['name'] !== undefined) {
      where['name'] = params.filters['name'];
    }
    if (params.filters['bio'] !== undefined) {
      where['bio'] = params.filters['bio'];
    }
    const orderBy: any = params.sort
      ? { [params.sort.field]: params.sort.order }
      : { id: 'desc' };
    const [data, total] = await prisma.$transaction([
      prisma.user.findMany({
        where,
        skip: params.skip,
        take: params.limit,
        orderBy,
        select: this.safeSelect,
      }),
      prisma.user.count({ where }),
    ]);

    return { data, total };
  }

  async findById(id: number): Promise<UserResponse | null> {
    return prisma.user.findUnique({
      where: { id: id },
      select: this.safeSelect,
    });
  }

  async create(data: UserPersistenceCreateInput): Promise<UserResponse> {
    return prisma.user.create({
      // Cast to any: custom type name clashes with Prisma's checked variant; scalar FKs resolve correctly at runtime.
      data: data as any,
      select: this.safeSelect,
    });
  }

  async update(id: number, data: UserUpdateInput): Promise<UserResponse | null> {
    try {
      return await prisma.user.update({
        where: { id: id },
        // Cast to any: see create() comment above.
        data: data as any,
        select: this.safeSelect,
      });
    } catch (err: any) {
      if (err.code === 'P2025') return null;
      throw err;
    }
  }

  async delete(id: number): Promise<boolean> {
    try {
      // Delete child records first to avoid FK constraint violations, then delete this entity.
      await prisma.$transaction([
        prisma.post.deleteMany({ where: { authorId: id } }),
        prisma.comment.deleteMany({ where: { authorId: id } }),
        prisma.user.delete({ where: { id: id } }),
      ]);
      return true;
    } catch (err: any) {
      if (err.code === 'P2025') return false;
      throw err;
    }
  }

  async findAuthByLogin(loginValue: string): Promise<UserRecord | null> {
    return prisma.user.findUnique({
      where: { email: loginValue },
    });
  }
}

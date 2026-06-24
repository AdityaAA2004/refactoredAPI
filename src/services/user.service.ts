import { ForbiddenError, NotFoundError, UnauthorizedError } from '../lib/errors.js';
import { ListQueryParams } from '../lib/pagination.js';
import { IUserRepository } from '../contracts/user.repository.contract.js';
import { IUserService } from '../contracts/user.service.contract.js';
import { UserCreateInput, UserPersistenceCreateInput, UserResponse, UserUpdateInput } from '../types/user.types.js';

export class UserService implements IUserService {
  constructor(private readonly repository: IUserRepository) {}

  async list(params: ListQueryParams): Promise<{ data: UserResponse[]; total: number }> {
    return this.repository.findMany(params);
  }

  async getById(id: number): Promise<UserResponse> {
    return this.requireRecord(id);
  }

  async create(data: UserCreateInput, actorId?: string | number): Promise<UserResponse> {
    const payload: UserPersistenceCreateInput = {
      ...data,
    };
    return this.repository.create(payload);
  }

  async update(
    id: number,
    data: UserUpdateInput,
    actorId?: string | number,
  ): Promise<UserResponse> {
    if (this.requireActorId(actorId) !== id) {
      throw new ForbiddenError('You may only update your own record');
    }
    const record = await this.repository.update(id, data);
    if (!record) {
      throw new NotFoundError('User', id);
    }
    return record;
  }

  async remove(id: number, actorId?: string | number): Promise<void> {
    if (this.requireActorId(actorId) !== id) {
      throw new ForbiddenError('You may only delete your own record');
    }
    const deleted = await this.repository.delete(id);
    if (!deleted) {
      throw new NotFoundError('User', id);
    }
  }

  private async requireRecord(id: number): Promise<UserResponse> {
    const record = await this.repository.findById(id);
    if (!record) {
      throw new NotFoundError('User', id);
    }
    return record;
  }

  private requireActorId(actorId?: string | number): string | number {
    if (actorId === undefined || actorId === null) {
      throw new UnauthorizedError('Authentication is required');
    }
    return actorId;
  }
}

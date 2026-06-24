import { ListQueryParams } from '../lib/pagination.js';
import { UserCreateInput, UserUpdateInput, UserPersistenceCreateInput, UserRecord, UserResponse } from '../types/user.types.js';

export interface IUserRepository {
  findMany(params: ListQueryParams): Promise<{ data: UserResponse[]; total: number }>;
  findById(id: number): Promise<UserResponse | null>;
  create(data: UserPersistenceCreateInput): Promise<UserResponse>;
  update(id: number, data: UserUpdateInput): Promise<UserResponse | null>;
  delete(id: number): Promise<boolean>;
  findAuthByLogin(loginValue: string): Promise<UserRecord | null>;
}

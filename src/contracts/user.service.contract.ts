import { ListQueryParams } from '../lib/pagination.js';
import { UserCreateInput, UserResponse, UserUpdateInput } from '../types/user.types.js';

export interface IUserService {
  list(params: ListQueryParams): Promise<{ data: UserResponse[]; total: number }>;
  getById(id: number): Promise<UserResponse>;
  create(data: UserCreateInput, actorId?: string | number): Promise<UserResponse>;
  update(id: number, data: UserUpdateInput, actorId?: string | number): Promise<UserResponse>;
  remove(id: number, actorId?: string | number): Promise<void>;
}

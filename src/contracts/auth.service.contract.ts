import { UserCreateInput, UserResponse } from '../types/user.types.js';

export interface AuthLoginInput {
  email: string;
  password: string;
}

export interface AuthRegisterResult {
  token: string;
  user: UserResponse;
}

export interface AuthLoginResult {
  token: string;
}

export interface IAuthService {
  register(data: UserCreateInput): Promise<AuthRegisterResult>;
  login(credentials: AuthLoginInput): Promise<AuthLoginResult>;
}

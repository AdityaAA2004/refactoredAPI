import { ConflictError, UnauthorizedError } from '../lib/errors.js';
import { IAuthService, AuthLoginInput, AuthLoginResult, AuthRegisterResult } from '../contracts/auth.service.contract.js';
import { IPasswordHasher } from '../contracts/password-hasher.contract.js';
import { ITokenService } from '../contracts/token-service.contract.js';
import { IUserRepository } from '../contracts/user.repository.contract.js';
import { UserCreateInput, UserPersistenceCreateInput, UserResponse } from '../types/user.types.js';

export class AuthService implements IAuthService {
  constructor(
    private readonly repository: IUserRepository,
    private readonly passwordHasher: IPasswordHasher,
    private readonly tokenService: ITokenService,
  ) {}

  async register(data: UserCreateInput): Promise<AuthRegisterResult> {
    try {
      const payload: UserPersistenceCreateInput = {
        ...data,
        password: await this.passwordHasher.hash(String(data.password)),
      };
      const user = await this.repository.create(payload);
      const token = await this.tokenService.sign(this.buildAuthPayload(user));
      return { token, user };
    } catch (err: any) {
      if (err?.code === 'P2002') {
        throw new ConflictError('An account with this email already exists');
      }
      throw err;
    }
  }

  async login(credentials: AuthLoginInput): Promise<AuthLoginResult> {
    const user = await this.repository.findAuthByLogin(credentials.email);
    if (!user) {
      throw new UnauthorizedError('Invalid credentials');
    }
    const valid = await this.passwordHasher.compare(
      credentials.password,
      String(user.password),
    );
    if (!valid) {
      throw new UnauthorizedError('Invalid credentials');
    }
    const safeUser = await this.repository.findById(user.id);
    if (!safeUser) {
      throw new UnauthorizedError('Invalid credentials');
    }
    const token = await this.tokenService.sign(this.buildAuthPayload(safeUser));
    return { token };
  }

  private buildAuthPayload(user: UserResponse): Record<string, unknown> {
    const { id: principalId, ...rest } = user as UserResponse & Record<string, unknown>;
    return { id: principalId, ...rest };
  }
}

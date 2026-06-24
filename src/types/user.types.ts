export interface UserRecord {
  id: number;
  email: string;
  name: string;
  password: string;
  bio?: string;
  createdAt: Date;
  updatedAt: Date;
}

export type UserResponse = Omit<UserRecord, 'password'>;

export interface UserCreateInput {
  email: string;
  name: string;
  password: string;
  bio?: string;
}

export type UserUpdateInput = Partial<UserCreateInput>;
export type UserPersistenceCreateInput = UserCreateInput;

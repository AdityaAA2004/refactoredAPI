export interface UserRecord {
  id: number;
  email: string;
  name: string;
  password: string;
  bio: string | null;
  createdAt: Date;
  updatedAt: Date;
}

export type UserResponse = Omit<UserRecord, 'password'>;

export interface UserCreateInput {
  email: string;
  name: string;
  password: string;
  bio?: string | null;
}

export type UserUpdateInput = Partial<UserCreateInput>;
export type UserPersistenceCreateInput = UserCreateInput;

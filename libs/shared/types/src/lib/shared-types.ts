export interface CreateUser {
  email: string;
  displayName: string;
  hashedPassword: string;
  hashedRefreshToken?: string;
}

export interface UpdateUser extends Partial<CreateUser> {
  id: number;
}

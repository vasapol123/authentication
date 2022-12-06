export interface CreateUser {
  email: string;
  displayName: string;
  hashedPassword: string;
  hashedRefreshToken?: string;
}

export interface UpdateUser extends Partial<CreateUser> {
  id: number;
}

export interface Tokens {
  jwtAccessToken: string;
  jwtRefreshToken: string;
}

export interface Signup {
  email: string;
  displayName: string;
  password: string;
  passwordConfirmation?: string;
}

export type Signin = Omit<Signup, 'displayName'>;

export interface JwtPayload {
  sub: number;
  email: string;
}

export interface JwtPayloadWithRefreshToken extends JwtPayload {
  refreshToken: string;
}

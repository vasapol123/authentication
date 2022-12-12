export interface CreateUser {
  email: string;
  displayName: string;
  hashedPassword: string;
  hashedRefreshToken?: string;
}

export type UpdateUser = Partial<CreateUser>;

export interface Signup {
  email: string;
  displayName: string;
  password: string;
  passwordConfirmation?: string;
}

export type Signin = Pick<Signup, 'email' | 'password'>;

export interface ForgotPassword {
  email: string;
}

export type ForgotPasswordToken = string;

export interface ResetPassword {
  newPassword: string;
  passwordConfirmation: string;
}

export interface sendMailPayload {
  toEmail: string;
  userId: number;
  displayName: string;
  forgotPasswordToken: ForgotPasswordToken;
}

export interface AuthTokens {
  jwtAccessToken: string;
  jwtRefreshToken: string;
}

export interface JwtPayload {
  sub: number;
  email: string;
  displayName: string;
}

export interface JwtPayloadWithRefreshToken extends JwtPayload {
  refreshToken: string;
}

export interface UserProfile {
  provider: string;
  providerId: string;
  email: string;
  displayName: string;
}

import { IsEmail, IsNotEmpty, IsString } from 'class-validator';

import { Signup } from '@authentication/types';

export class SignupDto implements Signup {
  @IsEmail()
  @IsString()
  @IsNotEmpty()
  email: string;

  @IsString()
  @IsNotEmpty()
  displayName: string;

  @IsString()
  @IsNotEmpty()
  password: string;
}

import { ForgotPassword } from '@authentication/types';
import { IsEmail, IsNotEmpty, IsString } from 'class-validator';

export class ForgotPasswordDto implements ForgotPassword {
  @IsEmail()
  @IsString()
  @IsNotEmpty()
  email: string;
}

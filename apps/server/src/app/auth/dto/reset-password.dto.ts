import { ResetPassword } from '@authentication/types';
import { IsNotEmpty, IsString } from 'class-validator';

export class ResetPasswordDto implements ResetPassword {
  @IsString()
  @IsNotEmpty()
  newPassword: string;

  @IsString()
  @IsNotEmpty()
  passwordConfirmation: string;
}

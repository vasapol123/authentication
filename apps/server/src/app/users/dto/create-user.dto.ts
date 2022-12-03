import { IsEmail, IsNotEmpty, IsString } from 'class-validator';
import { CreateUser } from '@authentication/types';

export class CreateUserDto implements CreateUser {
  @IsEmail()
  @IsNotEmpty()
  email: string;

  @IsString()
  @IsNotEmpty()
  displayName: string;

  @IsString()
  @IsNotEmpty()
  hashedPassword: string;

  @IsString()
  hashedRefreshToken?: string;
}

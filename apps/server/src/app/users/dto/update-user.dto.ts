import { PartialType } from '@nestjs/swagger';
import { IsNotEmpty, IsNumber } from 'class-validator';
import { UpdateUser } from '@authentication/types';

import { CreateUserDto } from './create-user.dto';

export class UpdateUserDto
  extends PartialType(CreateUserDto)
  implements UpdateUser
{
  @IsNumber()
  @IsNotEmpty()
  id: number;
}

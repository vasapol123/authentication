import { OmitType } from '@nestjs/swagger';
import { Signin } from '@authentication/types';

import { SignupDto } from './signup.dto';

export class SigninDto
  extends OmitType(SignupDto, ['displayName'] as const)
  implements Signin {}

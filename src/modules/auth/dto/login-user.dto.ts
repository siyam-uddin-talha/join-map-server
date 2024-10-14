import { ApiProperty } from '@nestjs/swagger';

export class LoginUserDTO {
  @ApiProperty({ example: 'example@email.com', description: 'User email' })
  readonly email: string;

  @ApiProperty({ example: '12345', description: 'User password' })
  readonly password: string;
}

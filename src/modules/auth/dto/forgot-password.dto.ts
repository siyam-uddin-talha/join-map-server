import { ApiProperty } from '@nestjs/swagger';

export class ForgotPasswordDTO {
  @ApiProperty({ example: 'example@email.com', description: 'User email' })
  readonly email: string;
}

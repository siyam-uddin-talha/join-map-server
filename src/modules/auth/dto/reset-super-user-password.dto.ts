import { ApiProperty } from '@nestjs/swagger';

export class ResetSuperUserPasswordDTO {
  @ApiProperty({ example: 'qwerty', description: 'New user password' })
  readonly newPassword: string;

  @ApiProperty({
    example:
      'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJzdWIiOiIxMjM0NTY3ODkwIiwibmFtZSI6IkpvaG4gRG9lIiwiaWF0IjoxNTE2MjM5MDIyfQ.SflKxwRJSMeKKF2QT4fwpMeJf36POk6yJV_adQssw5c',
    description: 'Reset password token',
  })
  readonly token: string;
}

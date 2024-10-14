import { ApiProperty } from '@nestjs/swagger';
import { IsString, IsEmail } from 'class-validator';

export class UpdateUserDTO {
  @ApiProperty({ example: 'example@email.com', description: 'User email' })
  @IsEmail()
  readonly email: string;

  @ApiProperty({ example: 'John', description: 'User first name' })
  @IsString()
  readonly firstName: string;

  @ApiProperty({ example: 'Carter', description: 'User last name' })
  @IsString()
  readonly lastName: string;

  @ApiProperty({ example: 'keep', description: 'User avatar type' })
  @IsString()
  readonly type: string;
}

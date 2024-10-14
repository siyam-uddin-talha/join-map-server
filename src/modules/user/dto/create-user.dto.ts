import { ApiProperty } from '@nestjs/swagger';
import { IsString, IsEmail, Length } from 'class-validator';

export class CreateUserDTO {
  @ApiProperty({ example: 'example@email.com', description: 'User email' })
  @IsEmail()
  readonly email: string;

  @ApiProperty({ example: '123456', description: 'User password' })
  @Length(6, 16, {
    message: 'Length should be 6 or more symbols and less or equal 16',
  })
  @IsString()
  readonly password: string;

  @ApiProperty({ example: 'John', description: 'User first name' })
  @IsString()
  readonly firstName: string;

  @ApiProperty({ example: 'Carter', description: 'User last name' })
  @IsString()
  readonly lastName: string;
}

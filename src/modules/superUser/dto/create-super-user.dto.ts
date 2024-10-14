import { ApiProperty } from '@nestjs/swagger';
import { IsEmail, IsOptional, IsString } from 'class-validator';

export class CreateSuperUserDto {
  @ApiProperty({ example: 'Super user', description: 'Name of super user' })
  @IsString()
  readonly name: string;

  @ApiProperty({ example: 'Paris', description: 'Address' })
  @IsString()
  readonly address: string;

  @ApiProperty({ example: 'ronal@gmail.com', description: 'Super user email' })
  @IsEmail()
  readonly email: string;

  @ApiProperty({
    example: '0000-0000',
    description: 'Super user Phone',
  })
  @IsString()
  readonly phone: string;
}

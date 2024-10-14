import { ApiProperty } from '@nestjs/swagger';
import { IsEmail, IsOptional, IsString } from 'class-validator';

export class UpdateSuperUserDto {
  @ApiProperty({ example: 'Super user', description: 'Name of super user' })
  @IsOptional()
  @IsString()
  readonly name: string;

  @ApiProperty({ example: 'Paris', description: 'Address' })
  @IsOptional()
  @IsString()
  readonly address: string;

  @ApiProperty({ example: 'ronal@gmail.com', description: 'Super user email' })
  @IsOptional()
  @IsEmail()
  readonly email: string;

  @ApiProperty({
    example: '0000-0000',
    description: 'Super user phone',
  })
  @IsOptional()
  @IsString()
  readonly phone: string;

  @ApiProperty({ example: '2023', description: 'Verified date' })
  @IsOptional()
  @IsString()
  readonly otpVerifiedAt: string;
}

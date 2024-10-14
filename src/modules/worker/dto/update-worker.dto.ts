import { ApiProperty } from '@nestjs/swagger';
import { IsEmail, IsOptional, IsString } from 'class-validator';

export class UpdateWorkerDto {
  @ApiProperty({ example: 'Worker', description: 'Name of worker' })
  @IsOptional()
  @IsString()
  readonly name: string;

  @ApiProperty({ example: 'Paris', description: 'Address' })
  @IsOptional()
  @IsString()
  readonly address: string;

  @ApiProperty({ example: 'ronal@gmail.com', description: 'Worker Email' })
  @IsOptional()
  @IsEmail()
  readonly email: string;

  @ApiProperty({
    example: '0000-0000',
    description: 'Worker Phone',
  })
  @IsOptional()
  @IsString()
  readonly phone: string;

  @ApiProperty({ example: 'https://example.com/', description: 'Website' })
  @IsOptional()
  @IsString()
  readonly website: string;

  @ApiProperty({ example: '2023', description: 'Verified date' })
  @IsOptional()
  @IsString()
  readonly otpVerifiedAt: string;
}

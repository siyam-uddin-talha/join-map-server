import { ApiProperty } from '@nestjs/swagger';
import { IsEmail, IsOptional, IsString } from 'class-validator';

export class CreateWorkerDto {
  @ApiProperty({ example: 'Worker', description: 'Name of worker' })
  @IsString()
  readonly name: string;

  @ApiProperty({ example: 'Paris', description: 'Address' })
  @IsString()
  readonly address: string;

  @ApiProperty({ example: 'ronal@gmail.com', description: 'Worker Email' })
  @IsEmail()
  readonly email: string;

  @ApiProperty({
    example: '0000-0000',
    description: 'Worker Phone',
  })
  @IsString()
  readonly phone: string;

  @ApiProperty({ example: 'https://example.com/', description: 'Website' })
  @IsOptional()
  @IsString()
  readonly website: string;
}

import { ApiProperty } from '@nestjs/swagger';
import { IsOptional, IsString } from 'class-validator';

export class UpdateWindowDto {
  @ApiProperty({ example: 'Example Window', description: 'Window' })
  @IsOptional()
  @IsString()
  readonly name: string;

  @ApiProperty({ example: 'Example description', description: 'Description' })
  @IsOptional()
  @IsString()
  readonly description: string;
}

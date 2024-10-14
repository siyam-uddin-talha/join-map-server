import { ApiProperty } from '@nestjs/swagger';
import { IsString } from 'class-validator';

export class UpdateStageDto {
  @ApiProperty({ example: 'Rest Stage', description: 'Stage Name' })
  @IsString()
  readonly name: string;
}

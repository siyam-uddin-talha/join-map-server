import { ApiProperty } from '@nestjs/swagger';
import { IsString } from 'class-validator';

export class CreateStageDto {
  @ApiProperty({ example: 'Rest Stage', description: 'Stage Name' })
  @IsString()
  readonly name: string;

  @ApiProperty({
    example: 'ffa31807-f019-43d7-a2b9-d2f899784d72',
    description: 'Hotel Id',
  })
  @IsString()
  readonly hotelId: string;
}

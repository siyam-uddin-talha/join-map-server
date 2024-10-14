import { ApiProperty } from '@nestjs/swagger';
import { IsString } from 'class-validator';

export class CreateAskChangeDto {
  @ApiProperty({
    example: 'This is window id',
    description: 'Window id',
  })
  @IsString()
  readonly windowId: string;
}

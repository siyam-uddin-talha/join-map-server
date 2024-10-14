import { ApiProperty } from '@nestjs/swagger';
import { IsString } from 'class-validator';

export class UpdateRoomDto {
  @ApiProperty({ example: 'Rest Room', description: 'Room Name' })
  @IsString()
  readonly name: string;
}

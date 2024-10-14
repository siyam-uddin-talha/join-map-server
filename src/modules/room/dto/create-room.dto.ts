import { ApiProperty } from '@nestjs/swagger';
import { IsString } from 'class-validator';

export class CreateRoomDto {
  @ApiProperty({ example: 'Rest Room', description: 'Room Name' })
  @IsString()
  readonly name: string;

  @ApiProperty({
    example: 'ffa31807-f019-43d7-a2b9-d2f899784d72',
    description: 'Stage Id',
  })
  @IsString()
  readonly stageId: string;
}

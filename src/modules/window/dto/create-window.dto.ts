import { ApiProperty } from '@nestjs/swagger';
import { IsString } from 'class-validator';

export class CreateWindowDto {
  @ApiProperty({ example: 'Example Window', description: 'Window' })
  @IsString()
  readonly name: string;

  @ApiProperty({ example: 'Example description', description: 'Description' })
  @IsString()
  readonly description: string;

  @ApiProperty({
    example: 'ffa31807-f019-43d7-a2b9-d2f899784d72',
    description: 'Room Id',
  })
  @IsString()
  readonly roomId: string;
}

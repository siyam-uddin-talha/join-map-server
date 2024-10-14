import { ApiProperty } from '@nestjs/swagger';
import { IsString } from 'class-validator';

export class CreateWindowCommentDto {
  @ApiProperty({
    example: 'This is an user window comment',
    description: 'User Window Comment',
  })
  @IsString()
  readonly comment: string;

  @ApiProperty({
    example: 'This is window id',
    description: 'Window id',
  })
  @IsString()
  readonly windowId: string;
}

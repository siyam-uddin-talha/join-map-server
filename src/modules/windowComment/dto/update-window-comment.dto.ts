import { ApiProperty } from '@nestjs/swagger';
import { IsString } from 'class-validator';

export class UpdateWindowCommentDto {
  @ApiProperty({
    example: 'This is an user window comment',
    description: 'User Window Comment',
  })
  @IsString()
  readonly comment: string;
}

import { ApiProperty } from '@nestjs/swagger';
import { IsOptional, IsString } from 'class-validator';

export class UpdateAskChangeDto {
  @ApiProperty({
    example: 'This is admin windowComment',
    description: 'Admin windowComment',
  })
  @IsString()
  readonly comment: string;

  @ApiProperty({
    example: 'Done',
    description: 'Request status',
  })
  @IsOptional()
  @IsString()
  readonly status: string;

  @ApiProperty({ example: 'keep', description: 'File upload status type' })
  @IsString()
  readonly type: string;
}

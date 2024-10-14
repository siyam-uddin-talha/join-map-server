import { ApiProperty } from '@nestjs/swagger';
import { IsDate, IsOptional, IsString } from 'class-validator';

export class UpdateAskAuditDto {
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

  @ApiProperty({
    example: '2023-12-01',
    description: 'Schedule Start Date',
  })
  @IsOptional()
  @IsDate()
  readonly scheduleStartDate: Date;

  @ApiProperty({
    example: '2023-12-03',
    description: 'Schedule End Date',
  })
  @IsOptional()
  @IsDate()
  readonly scheduleEndDate: Date;

  @ApiProperty({
    example:
      '[7fb5bcd8-9881-4377-af48-fc3f4161e1c7, 7fb5bcd8-9881-4377-af48-fc3f4161e1c9]',
    description: 'Worker Id group',
  })
  @IsOptional()
  @IsString()
  readonly workers: string;

  @ApiProperty({ example: 'keep', description: 'File upload status type' })
  @IsString()
  readonly type: string;
}

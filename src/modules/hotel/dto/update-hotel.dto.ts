import { ApiProperty } from '@nestjs/swagger';
import { IsString, IsNumber, IsOptional } from 'class-validator';

export class UpdateHotelDto {
  @ApiProperty({ example: '50.01', description: 'Longitude' })
  @IsOptional()
  @IsNumber()
  readonly longitude: number;

  @ApiProperty({ example: '0.91', description: 'Latitude' })
  @IsOptional()
  @IsNumber()
  readonly latitude: number;

  @ApiProperty({
    example: 'This is a big hotel',
    description: 'Hotel Description',
  })
  @IsOptional()
  @IsString()
  readonly description: string;

  @ApiProperty({ example: 'Sea hotel', description: 'Hotel Name' })
  @IsOptional()
  @IsString()
  readonly name: string;

  @ApiProperty({ example: 'keep', description: 'File upload status type' })
  @IsString()
  readonly type: string;
}

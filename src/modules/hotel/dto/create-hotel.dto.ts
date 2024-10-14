import { ApiProperty } from '@nestjs/swagger';
import { IsString, IsNumber } from 'class-validator';

export class CreateHotelDto {
  @ApiProperty({ example: 50.01, description: 'Longitude' })
  @IsNumber()
  readonly longitude: number;

  @ApiProperty({ example: 0.91, description: 'Latitude' })
  @IsNumber()
  readonly latitude: number;

  @ApiProperty({
    example: 'This is a big hotel',
    description: 'Hotel Description',
  })
  @IsString()
  readonly description: string;

  @ApiProperty({ example: 'Sea hotel', description: 'Hotel Name' })
  @IsString()
  readonly name: string;
}

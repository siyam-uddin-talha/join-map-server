import { ApiProperty } from '@nestjs/swagger';
import { IsNumber, IsString } from 'class-validator';

export class CreateAskAuditDto {
  @ApiProperty({
    example: 'This is window id',
    description: 'Window id',
  })
  @IsString()
  readonly windowId: string;

  @ApiProperty({
    example: 'This is applicant full name',
    description: 'Full Name',
  })
  @IsString()
  readonly applicantFullName: string;

  @ApiProperty({
    example: 'This is applicant tel',
    description: '111-111',
  })
  @IsString()
  readonly applicantTel: string;

  @ApiProperty({
    example: 'This is applicant date',
    description: '2023-11-01',
  })
  @IsString()
  readonly applicantDate: string;

  @ApiProperty({
    example: 'This is location name',
    description: 'Location',
  })
  @IsString()
  readonly locationName: string;

  @ApiProperty({
    example: 'This is location address',
    description: 'Location Address',
  })
  @IsString()
  readonly locationAddress: string;

  @ApiProperty({
    example: 'This is location cp',
    description: 'Location Cp',
  })
  @IsString()
  readonly locationCp: string;

  @ApiProperty({
    example: 'This is location city',
    description: 'Location City',
  })
  @IsString()
  readonly locationCity: string;

  @ApiProperty({
    example: 'This is local contact full name',
    description: 'Local Contact Full Name',
  })
  @IsString()
  readonly localContactFullName: string;

  @ApiProperty({
    example: 'This is local contact tel',
    description: 'Local Contact Tel',
  })
  @IsString()
  readonly localContactTel: string;

  @ApiProperty({
    example: 'This is installation year',
    description: '5',
  })
  @IsString()
  readonly installationYear: string;

  @ApiProperty({
    example: 'This is manufacturer brand',
    description: '5',
  })
  @IsString()
  readonly manufacturerBrand: string;

  @ApiProperty({
    example: 'This is additional info',
    description: 'additional info',
  })
  @IsString()
  readonly additionalInfo: string;

  @ApiProperty({
    example: 'This is available',
    description: 'available',
  })
  @IsString()
  readonly available: string;

  @ApiProperty({
    example: 'This is material',
    description: 'material',
  })
  @IsString()
  readonly material: string;

  @ApiProperty({
    example: 'This is deadline',
    description: 'deadline',
  })
  @IsNumber()
  readonly deadline: number;

  @ApiProperty({
    example: 'This is joinery number',
    description: 'joinery number',
  })
  @IsNumber()
  readonly joineryNumber: number;
}

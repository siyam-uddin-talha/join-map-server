import {
  Controller,
  Get,
  Param,
  HttpStatus,
  HttpCode,
  UseGuards,
  Query,
  Post,
  Put,
  Delete,
  Body,
  UseInterceptors,
  UploadedFile,
} from '@nestjs/common';
import {
  ApiHeader,
  ApiOkResponse,
  ApiOperation,
  ApiTags,
} from '@nestjs/swagger';

import { HotelService } from './hotel.service';
import { Hotel } from './entities';
import { JwtAuthGuard } from '../auth/jwt-auth.guard';
import { CreateHotelDto } from './dto/create-hotel.dto';
import { UpdateHotelDto } from './dto/update-hotel.dto';
import { FileInterceptor } from '@nestjs/platform-express';
import { diskStorage } from 'multer';
import * as mimeTypes from 'mime-types';

@ApiTags('Hotels')
@Controller('hotels')
export class HotelController {
  constructor(private readonly hotelService: HotelService) {}

  @UseGuards(JwtAuthGuard)
  @Post('/')
  @UseInterceptors(
    FileInterceptor('file', {
      storage: diskStorage({
        destination: './upload',
        filename: (req, file, cb) => {
          const extension = mimeTypes.extension(file.mimetype);
          const uniqueFilename = Array(32)
            .fill(null)
            .map(() => Math.round(Math.random() * 16).toString(16))
            .join('');
          cb(null, `${uniqueFilename}.${extension}`);
        },
      }),
    }),
  )
  create(
    @Body() data: CreateHotelDto,
    @UploadedFile() file: Express.Multer.File,
  ) {
    return this.hotelService.create(data, file);
  }

  @UseGuards(JwtAuthGuard)
  @Post('/upload')
  @UseInterceptors(
    FileInterceptor('file', {
      storage: diskStorage({
        destination: './upload',
        filename: (req, file, cb) => {
          const extension = mimeTypes.extension(file.mimetype);
          const uniqueFilename = Array(32)
            .fill(null)
            .map(() => Math.round(Math.random() * 16).toString(16))
            .join('');
          cb(null, `${uniqueFilename}.${extension}`);
        },
      }),
    }),
  )
  uploadExcelFile(@UploadedFile() file: Express.Multer.File) {
    return this.hotelService.uploadExcelFile(file);
  }

  @UseGuards(JwtAuthGuard)
  @Put('/:hotel_id')
  @UseInterceptors(
    FileInterceptor('file', {
      storage: diskStorage({
        destination: './upload',
        filename: (req, file, cb) => {
          const extension = mimeTypes.extension(file.mimetype);
          const uniqueFilename = Array(32)
            .fill(null)
            .map(() => Math.round(Math.random() * 16).toString(16))
            .join('');
          cb(null, `${uniqueFilename}.${extension}`);
        },
      }),
    }),
  )
  update(
    @Body() data: UpdateHotelDto,
    @Param('hotel_id') hotel_id: string,
    @UploadedFile() file: Express.Multer.File,
  ) {
    return this.hotelService.update(hotel_id, data, file);
  }

  @UseGuards(JwtAuthGuard)
  @Delete('/:hotel_id')
  delete(@Param('hotel_id') hotel_id: string) {
    return this.hotelService.delete(hotel_id);
  }
  @UseGuards(JwtAuthGuard)
  @Get('/')
  getAllHotels(@Query() query: any) {
    return this.hotelService.getAll(query);
  }

  @ApiOperation({ summary: 'Get hotel' })
  @ApiOkResponse({ status: 200, type: Hotel })
  @ApiHeader({
    name: 'Authorization',
    description: 'Authorization header with token',
    required: true,
  })
  @UseGuards(JwtAuthGuard)
  @HttpCode(HttpStatus.OK)
  @Get(':id')
  get(@Param('id') id: string) {
    return this.hotelService.getById(id);
  }
}

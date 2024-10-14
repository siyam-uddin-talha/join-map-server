import {
  Controller,
  Get,
  Param,
  HttpStatus,
  HttpCode,
  UseGuards,
  Query,
  UseInterceptors,
  Put,
  UploadedFile,
  Body,
} from '@nestjs/common';
import {
  ApiHeader,
  ApiOkResponse,
  ApiOperation,
  ApiTags,
} from '@nestjs/swagger';

import { UserService } from './user.service';
import { User } from './entities';
import { JwtAuthGuard } from '../auth/jwt-auth.guard';
import { FileInterceptor } from '@nestjs/platform-express';
import { UpdateUserDTO } from './dto/update-user.dto';
import { diskStorage } from 'multer';
import * as mimeTypes from 'mime-types';

@ApiTags('Users')
@Controller('users')
export class UserController {
  constructor(private readonly userService: UserService) {}

  @UseGuards(JwtAuthGuard)
  @Get('/')
  getAllUser(@Query() query: any) {
    return this.userService.getAll(query);
  }

  @ApiOperation({ summary: 'Get user' })
  @ApiOkResponse({ status: 200, type: User })
  @ApiHeader({
    name: 'Authorization',
    description: 'Authorization header with token',
    required: true,
  })
  @UseGuards(JwtAuthGuard)
  @HttpCode(HttpStatus.OK)
  @Get(':id')
  get(@Param('id') id: string) {
    return this.userService.getById(id);
  }

  @UseGuards(JwtAuthGuard)
  @Put('/:user_id')
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
    @UploadedFile() file: Express.Multer.File,
    @Param('user_id') user_id: string,
    @Body() data: UpdateUserDTO,
  ) {
    return this.userService.update(file, user_id, data);
  }
}

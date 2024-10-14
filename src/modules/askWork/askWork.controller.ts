import {
  Controller,
  Get,
  Param,
  HttpStatus,
  UseGuards,
  Query,
  Post,
  Put,
  Body,
  Request,
  Res,
  UseInterceptors,
  UploadedFile,
  UploadedFiles,
} from '@nestjs/common';
import { ApiTags } from '@nestjs/swagger';

import { AskWorkService } from './askWork.service';
import { JwtAuthGuard } from '../auth/jwt-auth.guard';
import { CreateAskWorkDto } from './dto/create-ask-work.dto';
import { UpdateAskWorkDto } from './dto/update-ask-work.dto';
import { Response } from 'express';
import {
  FileFieldsInterceptor,
  FileInterceptor,
} from '@nestjs/platform-express';
import { diskStorage } from 'multer';
import * as mimeTypes from 'mime-types';
import { UpdateAskWorkOnUserDto } from './dto/update-ask-work-user.dto';

@ApiTags('AskWorks')
@Controller('ask-works')
export class AskWorkController {
  constructor(private readonly askWorkService: AskWorkService) {}

  @UseGuards(JwtAuthGuard)
  @Post('/')
  @UseInterceptors(
    FileFieldsInterceptor(
      [
        { name: 'completedFile', maxCount: 1 },
        { name: 'defaultFile', maxCount: 1 },
      ],
      {
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
      },
    ),
  )
  async create(
    @Body() data: CreateAskWorkDto,
    @Request() req: any,
    @UploadedFiles()
    files: {
      avatar?: Express.Multer.File[];
      background?: Express.Multer.File[];
    },
  ) {
    return this.askWorkService.create(data, req.user.id, files);
  }

  @UseGuards(JwtAuthGuard)
  @Put('/:ask_work_id')
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
    @Body() data: UpdateAskWorkDto,
    @Param('ask_work_id') ask_work_id: string,
    @UploadedFile() file: Express.Multer.File,
  ) {
    return this.askWorkService.update(ask_work_id, data, file);
  }

  @UseGuards(JwtAuthGuard)
  @Put('/:ask_work_id/user')
  @UseInterceptors(
    FileFieldsInterceptor(
      [
        { name: 'completedFile', maxCount: 1 },
        { name: 'defaultFile', maxCount: 1 },
      ],
      {
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
      },
    ),
  )
  updateOnUser(
    @Body() data: UpdateAskWorkOnUserDto,
    @Param('ask_work_id') ask_work_id: string,
    @UploadedFiles()
    files: {
      avatar?: Express.Multer.File[];
      background?: Express.Multer.File[];
    },
  ) {
    return this.askWorkService.updateOnUser(ask_work_id, data, files);
  }

  @UseGuards(JwtAuthGuard)
  @Get('/')
  fetchAll(@Query() query: any) {
    return this.askWorkService.fetchAll(query);
  }

  @UseGuards(JwtAuthGuard)
  @Post('/windows/:window_id')
  fetchSubmitStatus(
    @Param('window_id') window_id: string,
    @Request() req: any,
  ) {
    return this.askWorkService.fetchSubmitStatus(window_id, req.user.id);
  }

  @UseGuards(JwtAuthGuard)
  @Get('/statistics')
  fetchAllStatistics(@Query() query: any) {
    return this.askWorkService.fetchStatistics(query);
  }

  @UseGuards(JwtAuthGuard)
  @Get('/:ask_work_id')
  getOne(@Param('ask_work_id') ask_work_id: string) {
    return this.askWorkService.getById(ask_work_id);
  }

  @UseGuards(JwtAuthGuard)
  @Post('/:ask_work_id/cancel')
  async cancelRequest(@Param('ask_work_id') ask_work_id: string) {
    return this.askWorkService.cancelRequest(ask_work_id);
  }

  @UseGuards(JwtAuthGuard)
  @Post('/:ask_work_id/done')
  async doneRequest(@Param('ask_work_id') ask_work_id: string) {
    return this.askWorkService.doneRequest(ask_work_id);
  }

  @UseGuards(JwtAuthGuard)
  @Post('/:ask_work_id/reopen')
  async reopenRequest(@Param('ask_work_id') ask_work_id: string) {
    return this.askWorkService.reopenRequest(ask_work_id);
  }
}

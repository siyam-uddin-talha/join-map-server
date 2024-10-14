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
} from '@nestjs/common';
import { ApiTags } from '@nestjs/swagger';

import { AskChangeService } from './askChange.service';
import { JwtAuthGuard } from '../auth/jwt-auth.guard';
import { CreateAskChangeDto } from './dto/create-ask-change.dto';
import { UpdateAskChangeDto } from './dto/update-ask-change.dto';
import { Response } from 'express';
import { FileInterceptor } from '@nestjs/platform-express';
import { diskStorage } from 'multer';
import * as mimeTypes from 'mime-types';

@ApiTags('AskChanges')
@Controller('ask-changes')
export class AskChangeController {
  constructor(private readonly askChangeService: AskChangeService) {}

  @UseGuards(JwtAuthGuard)
  @Post('/')
  async create(@Body() data: CreateAskChangeDto, @Request() req: any) {
    return this.askChangeService.create(data, req.user.id);
  }

  @UseGuards(JwtAuthGuard)
  @Put('/:ask_change_id')
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
    @Body() data: UpdateAskChangeDto,
    @Param('ask_change_id') ask_change_id: string,
    @UploadedFile() file: Express.Multer.File,
  ) {
    return this.askChangeService.update(ask_change_id, data, file);
  }

  @UseGuards(JwtAuthGuard)
  @Get('/')
  fetchAll(@Query() query: any) {
    return this.askChangeService.fetchAll(query);
  }

  @UseGuards(JwtAuthGuard)
  @Post('/windows/:window_id')
  fetchSubmitStatus(
    @Param('window_id') window_id: string,
    @Request() req: any,
  ) {
    return this.askChangeService.fetchSubmitStatus(window_id, req.user.id);
  }

  @UseGuards(JwtAuthGuard)
  @Post('/:ask_change_id/cancel')
  async cancelRequest(
    @Param('ask_change_id') ask_change_id: string,
    @Res() res: Response,
  ) {
    await this.askChangeService.cancelRequest(ask_change_id);
    return res.status(HttpStatus.OK).send({
      success: true,
      msg: 'This request is closed.',
    });
  }

  @UseGuards(JwtAuthGuard)
  @Get('/statistics')
  fetchAllStatistics(@Query() query: any) {
    return this.askChangeService.fetchStatistics(query);
  }

  @UseGuards(JwtAuthGuard)
  @Get('/:ask_change_id')
  getOne(@Param('ask_change_id') ask_change_id: string) {
    return this.askChangeService.getById(ask_change_id);
  }
}

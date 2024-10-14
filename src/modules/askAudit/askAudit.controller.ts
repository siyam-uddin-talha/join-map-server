import {
  Controller,
  Get,
  Param,
  UseGuards,
  Query,
  Post,
  Put,
  Body,
  Request,
  UseInterceptors,
  UploadedFile,
  HttpStatus,
  Res,
  UploadedFiles,
} from '@nestjs/common';
import { ApiTags } from '@nestjs/swagger';

import { AskAuditService } from './askAudit.service';
import { JwtAuthGuard } from '../auth/jwt-auth.guard';
import { CreateAskAuditDto } from './dto/create-ask-audit.dto';
import { UpdateAskAuditDto } from './dto/update-ask-audit.dto';
import {
  FileFieldsInterceptor,
  FileInterceptor,
} from '@nestjs/platform-express';
import { diskStorage } from 'multer';
import * as mimeTypes from 'mime-types';
import { Response } from 'express';
import { UpdateAskAuditUserDto } from './dto/update-ask-audit-user.dto';

@ApiTags('AskAudits')
@Controller('ask-audits')
export class AskAuditController {
  constructor(private readonly askAuditService: AskAuditService) {}

  @UseGuards(JwtAuthGuard)
  @Post('/')
  @UseInterceptors(
    FileFieldsInterceptor(
      [
        { name: 'planFile', maxCount: 1 },
        { name: 'joineryPhotoFile', maxCount: 1 },
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
    @Body() data: CreateAskAuditDto,
    @Request() req: any,
    @UploadedFiles()
    files: {
      avatar?: Express.Multer.File[];
      background?: Express.Multer.File[];
    },
  ) {
    return this.askAuditService.create(data, req.user.id, files);
  }

  @UseGuards(JwtAuthGuard)
  @Put('/:ask_audit_id')
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
    @Body() data: UpdateAskAuditDto,
    @Param('ask_audit_id') ask_audit_id: string,
    @UploadedFile() file: Express.Multer.File,
  ) {
    return this.askAuditService.update(ask_audit_id, data, file);
  }

  @UseGuards(JwtAuthGuard)
  @Put('/:ask_audit_id/user')
  @UseInterceptors(
    FileFieldsInterceptor(
      [
        { name: 'planFile', maxCount: 1 },
        { name: 'joineryPhotoFile', maxCount: 1 },
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
    @Body() data: UpdateAskAuditUserDto,
    @Param('ask_audit_id') ask_audit_id: string,
    @UploadedFiles()
    files: {
      avatar?: Express.Multer.File[];
      background?: Express.Multer.File[];
    },
  ) {
    return this.askAuditService.updateOnUser(ask_audit_id, data, files);
  }

  @UseGuards(JwtAuthGuard)
  @Post('/windows/:window_id')
  fetchSubmitStatus(
    @Param('window_id') window_id: string,
    @Request() req: any,
  ) {
    return this.askAuditService.fetchSubmitStatus(window_id, req.user.id);
  }

  @UseGuards(JwtAuthGuard)
  @Post('/:ask_audit_id/cancel')
  async cancelRequest(@Param('ask_audit_id') ask_audit_id: string) {
    return this.askAuditService.cancelRequest(ask_audit_id);
  }

  @UseGuards(JwtAuthGuard)
  @Post('/:ask_audit_id/done')
  async doneRequest(@Param('ask_audit_id') ask_audit_id: string) {
    return this.askAuditService.doneRequest(ask_audit_id);
  }

  @UseGuards(JwtAuthGuard)
  @Post('/:ask_audit_id/reopen')
  async reopenRequest(@Param('ask_audit_id') ask_audit_id: string) {
    return this.askAuditService.reopenRequest(ask_audit_id);
  }

  @UseGuards(JwtAuthGuard)
  @Get('/')
  fetchAll(@Query() query: any) {
    return this.askAuditService.fetchAll(query);
  }

  @UseGuards(JwtAuthGuard)
  @Get('/statistics')
  fetchAllStatistics(@Query() query: any) {
    return this.askAuditService.fetchStatistics(query);
  }

  @UseGuards(JwtAuthGuard)
  @Get('/:ask_audit_id')
  getOne(@Param('ask_audit_id') ask_audit_id: string) {
    return this.askAuditService.getById(ask_audit_id);
  }
}

import { Controller, Get, Param, Res } from '@nestjs/common';
import { Response } from 'express';
import { join } from 'path';

@Controller('download')
export class DownloadController {
  @Get(':filename')
  downloadFile(@Param('filename') filename: string, @Res() res: Response) {
    const filePath = join(__dirname, '../../..', 'upload', filename);
    return res.download(filePath);
  }
}

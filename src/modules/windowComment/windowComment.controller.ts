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
  Body,
  Request,
} from '@nestjs/common';
import {
  ApiHeader,
  ApiOkResponse,
  ApiOperation,
  ApiTags,
} from '@nestjs/swagger';

import { WindowCommentService } from './windowComment.service';
import { WindowComment } from './entities';
import { JwtAuthGuard } from '../auth/jwt-auth.guard';
import { CreateWindowCommentDto } from './dto/create-window-comment.dto';
import { UpdateWindowCommentDto } from './dto/update-window-comment.dto';

@ApiTags('WindowComments')
@Controller('window-comments')
export class WindowCommentController {
  constructor(private readonly windowCommentService: WindowCommentService) {}

  @UseGuards(JwtAuthGuard)
  @Post('/')
  create(@Body() data: CreateWindowCommentDto, @Request() req: any) {
    return this.windowCommentService.create(data, req.user.id);
  }

  @UseGuards(JwtAuthGuard)
  @Put('/:window_comment_id')
  update(
    @Body() data: UpdateWindowCommentDto,
    @Param('window_comment_id') window_comment_id: string,
  ) {
    return this.windowCommentService.update(window_comment_id, data);
  }

  @UseGuards(JwtAuthGuard)
  @Get('/')
  getAllWindowComments(@Query() query: any) {
    return this.windowCommentService.getAll(query);
  }

  @UseGuards(JwtAuthGuard)
  @Get('/windows/:window_id')
  fetchOneByWindow(@Param('window_id') window_id: string, @Request() req: any) {
    return this.windowCommentService.fetchOneByWindow(window_id, req.user.id);
  }

  @ApiOperation({ summary: 'Get window comment' })
  @ApiOkResponse({ status: 200, type: WindowComment })
  @ApiHeader({
    name: 'Authorization',
    description: 'Authorization header with token',
    required: true,
  })
  @UseGuards(JwtAuthGuard)
  @HttpCode(HttpStatus.OK)
  @Get(':id')
  get(@Param('id') id: string) {
    return this.windowCommentService.getById(id);
  }
}

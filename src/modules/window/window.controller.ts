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
} from '@nestjs/common';
import {
  ApiHeader,
  ApiOkResponse,
  ApiOperation,
  ApiTags,
} from '@nestjs/swagger';

import { WindowService } from './window.service';
import { Window } from './entities';
import { JwtAuthGuard } from '../auth/jwt-auth.guard';
import { CreateWindowDto } from './dto/create-window.dto';
import { UpdateWindowDto } from './dto/update-window.dto';

@ApiTags('Windows')
@Controller('windows')
export class WindowController {
  constructor(private readonly windowService: WindowService) {}

  @UseGuards(JwtAuthGuard)
  @Post('/')
  create(@Body() data: CreateWindowDto) {
    return this.windowService.create(data);
  }

  @UseGuards(JwtAuthGuard)
  @Put('/:window_id')
  update(@Body() data: UpdateWindowDto, @Param('window_id') window_id: string) {
    return this.windowService.update(window_id, data);
  }

  @UseGuards(JwtAuthGuard)
  @Delete('/:window_id')
  delete(@Param('window_id') window_id: string) {
    return this.windowService.delete(window_id);
  }
  @UseGuards(JwtAuthGuard)
  @Get('/')
  getAllWindows(@Query() query: any) {
    return this.windowService.getAll(query);
  }

  @ApiOperation({ summary: 'Get window' })
  @ApiOkResponse({ status: 200, type: Window })
  @ApiHeader({
    name: 'Authorization',
    description: 'Authorization header with token',
    required: true,
  })
  @UseGuards(JwtAuthGuard)
  @HttpCode(HttpStatus.OK)
  @Get(':id')
  get(@Param('id') id: string) {
    return this.windowService.getById(id);
  }
}

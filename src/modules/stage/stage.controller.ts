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

import { StageService } from './stage.service';
import { Stage } from './entities';
import { JwtAuthGuard } from '../auth/jwt-auth.guard';
import { CreateStageDto } from './dto/create-stage.dto';
import { UpdateStageDto } from './dto/update-stage.dto';

@ApiTags('Stages')
@Controller('stages')
export class StageController {
  constructor(private readonly stageService: StageService) {}

  @UseGuards(JwtAuthGuard)
  @Post('/')
  create(@Body() data: CreateStageDto) {
    return this.stageService.create(data);
  }

  @UseGuards(JwtAuthGuard)
  @Put('/:stage_id')
  update(@Body() data: UpdateStageDto, @Param('stage_id') stage_id: string) {
    return this.stageService.update(stage_id, data);
  }

  @UseGuards(JwtAuthGuard)
  @Delete('/:stage_id')
  delete(@Param('stage_id') stage_id: string) {
    return this.stageService.delete(stage_id);
  }
  @UseGuards(JwtAuthGuard)
  @Get('/')
  getAllStages(@Query() query: any) {
    return this.stageService.getAll(query);
  }

  @ApiOperation({ summary: 'Get stage' })
  @ApiOkResponse({ status: 200, type: Stage })
  @ApiHeader({
    name: 'Authorization',
    description: 'Authorization header with token',
    required: true,
  })
  @UseGuards(JwtAuthGuard)
  @HttpCode(HttpStatus.OK)
  @Get(':id')
  get(@Param('id') id: string) {
    return this.stageService.getById(id);
  }
}

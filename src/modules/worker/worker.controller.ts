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
  Request,
} from '@nestjs/common';
import {
  ApiHeader,
  ApiOkResponse,
  ApiOperation,
  ApiTags,
} from '@nestjs/swagger';

import { WorkerService } from './worker.service';
import { Worker } from './entities';
import { JwtAuthGuard } from '../auth/jwt-auth.guard';
import { CreateWorkerDto } from './dto/create-worker.dto';
import { UpdateWorkerDto } from './dto/update-worker.dto';

@ApiTags('Workers')
@Controller('workers')
export class WorkerController {
  constructor(private readonly workerService: WorkerService) {}

  @UseGuards(JwtAuthGuard)
  @Post('/')
  create(@Body() data: CreateWorkerDto) {
    return this.workerService.create(data);
  }

  @UseGuards(JwtAuthGuard)
  @Put('/:worker_id')
  update(@Body() data: UpdateWorkerDto, @Param('worker_id') worker_id: string) {
    return this.workerService.update(worker_id, data);
  }

  @UseGuards(JwtAuthGuard)
  @Delete('/:worker_id')
  delete(@Param('worker_id') worker_id: string) {
    return this.workerService.delete(worker_id);
  }

  @ApiOperation({ summary: 'Get free worker' })
  @ApiOkResponse({ status: 200, type: Worker })
  @ApiHeader({
    name: 'Authorization',
    description: 'Authorization header with token',
    required: true,
  })
  @UseGuards(JwtAuthGuard)
  @HttpCode(HttpStatus.OK)
  @Get('free')
  getFreeWorkers() {
    return this.workerService.getAllFreeWorkers();
  }

  @UseGuards(JwtAuthGuard)
  @Get('')
  getAllWorkers(@Query() query: any) {
    return this.workerService.getAll(query);
  }

  @UseGuards(JwtAuthGuard)
  @Get('/current-request')
  fetchCurrentRequest(@Request() req: any) {
    return this.workerService.fetchCurrentRequest(req.user.id);
  }

  @UseGuards(JwtAuthGuard)
  @Get('/team-members')
  fetchTeamMembers(@Request() req: any) {
    return this.workerService.fetchTeamMembers(req.user.id);
  }

  @ApiOperation({ summary: 'Get worker' })
  @ApiOkResponse({ status: 200, type: Worker })
  @ApiHeader({
    name: 'Authorization',
    description: 'Authorization header with token',
    required: true,
  })
  @UseGuards(JwtAuthGuard)
  @HttpCode(HttpStatus.OK)
  @Get(':id')
  get(@Param('id') id: string) {
    return this.workerService.getById(id);
  }
}

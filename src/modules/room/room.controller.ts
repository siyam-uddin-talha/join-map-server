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

import { RoomService } from './room.service';
import { Room } from './entities';
import { JwtAuthGuard } from '../auth/jwt-auth.guard';
import { CreateRoomDto } from './dto/create-room.dto';
import { UpdateRoomDto } from './dto/update-room.dto';

@ApiTags('Rooms')
@Controller('rooms')
export class RoomController {
  constructor(private readonly roomService: RoomService) {}

  @UseGuards(JwtAuthGuard)
  @Post('/')
  create(@Body() data: CreateRoomDto) {
    return this.roomService.create(data);
  }

  @UseGuards(JwtAuthGuard)
  @Put('/:room_id')
  update(@Body() data: UpdateRoomDto, @Param('room_id') room_id: string) {
    return this.roomService.update(room_id, data);
  }

  @UseGuards(JwtAuthGuard)
  @Delete('/:room_id')
  delete(@Param('room_id') room_id: string) {
    return this.roomService.delete(room_id);
  }
  @UseGuards(JwtAuthGuard)
  @Get('/')
  getAllRooms(@Query() query: any) {
    return this.roomService.getAll(query);
  }

  @ApiOperation({ summary: 'Get room' })
  @ApiOkResponse({ status: 200, type: Room })
  @ApiHeader({
    name: 'Authorization',
    description: 'Authorization header with token',
    required: true,
  })
  @UseGuards(JwtAuthGuard)
  @HttpCode(HttpStatus.OK)
  @Get(':id')
  get(@Param('id') id: string) {
    return this.roomService.getById(id);
  }
}

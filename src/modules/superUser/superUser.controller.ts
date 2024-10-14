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

import { SuperUserService } from './superUser.service';
import { SuperUser } from './entities';
import { JwtAuthGuard } from '../auth/jwt-auth.guard';
import { CreateSuperUserDto } from './dto/create-super-user.dto';
import { UpdateSuperUserDto } from './dto/update-super-user.dto';

@ApiTags('SuperUsers')
@Controller('super-users')
export class SuperUserController {
  constructor(private readonly superUserService: SuperUserService) {}

  @UseGuards(JwtAuthGuard)
  @Post('/')
  create(@Body() data: CreateSuperUserDto) {
    return this.superUserService.create(data);
  }

  @UseGuards(JwtAuthGuard)
  @Put('/:super_user_id')
  update(
    @Body() data: UpdateSuperUserDto,
    @Param('super_user_id') super_user_id: string,
  ) {
    return this.superUserService.update(super_user_id, data);
  }

  @UseGuards(JwtAuthGuard)
  @Delete('/:super_user_id')
  delete(@Param('super_user_id') super_user_id: string) {
    return this.superUserService.delete(super_user_id);
  }

  @UseGuards(JwtAuthGuard)
  @Get('')
  getAllSuperUsers(@Query() query: any) {
    return this.superUserService.getAll(query);
  }

  @ApiOperation({ summary: 'Get super user' })
  @ApiOkResponse({ status: 200, type: SuperUser })
  @ApiHeader({
    name: 'Authorization',
    description: 'Authorization header with token',
    required: true,
  })
  @UseGuards(JwtAuthGuard)
  @HttpCode(HttpStatus.OK)
  @Get(':id')
  get(@Param('id') id: string) {
    return this.superUserService.getById(id);
  }
}

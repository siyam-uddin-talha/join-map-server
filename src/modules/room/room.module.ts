import { forwardRef, Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';

import { RoomService } from './room.service';
import { RoomController } from './room.controller';
import { Room } from './entities';
import { JwtModule } from '@nestjs/jwt';
import { StageModule } from '../stage/stage.module';
import { Stage } from '../stage/entities';

@Module({
  imports: [
    TypeOrmModule.forFeature([Stage, Room]),
    JwtModule.register({
      secret: process.env.JWT_ACCESS_TOKEN_KEY || 'SECRET',
      signOptions: { expiresIn: '24h' },
    }),
    forwardRef(() => StageModule),
  ],
  controllers: [RoomController],
  providers: [RoomService],
  exports: [RoomService],
})
export class RoomModule {}

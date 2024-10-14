import { forwardRef, Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';

import { WindowService } from './window.service';
import { WindowController } from './window.controller';
import { Window } from './entities';
import { JwtModule } from '@nestjs/jwt';
import { RoomModule } from '../room/room.module';
import { Room } from '../room/entities';

@Module({
  imports: [
    TypeOrmModule.forFeature([Window, Room]),
    JwtModule.register({
      secret: process.env.JWT_ACCESS_TOKEN_KEY || 'SECRET',
      signOptions: { expiresIn: '24h' },
    }),
    forwardRef(() => RoomModule),
  ],
  controllers: [WindowController],
  providers: [WindowService],
  exports: [WindowService],
})
export class WindowModule {}

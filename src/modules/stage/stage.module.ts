import { forwardRef, Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';

import { StageService } from './stage.service';
import { StageController } from './stage.controller';
import { Stage } from './entities';
import { JwtModule } from '@nestjs/jwt';
import { HotelModule } from '../hotel/hotel.module';
import { Hotel } from '../hotel/entities';

@Module({
  imports: [
    TypeOrmModule.forFeature([Stage, Hotel]),
    JwtModule.register({
      secret: process.env.JWT_ACCESS_TOKEN_KEY || 'SECRET',
      signOptions: { expiresIn: '24h' },
    }),
    forwardRef(() => HotelModule),
  ],
  controllers: [StageController],
  providers: [StageService],
  exports: [StageService],
})
export class StageModule {}

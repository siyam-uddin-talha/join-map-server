import { forwardRef, Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';

import { HotelService } from './hotel.service';
import { HotelController } from './hotel.controller';
import { Hotel } from './entities';
import { JwtModule } from '@nestjs/jwt';
import { StageModule } from '../stage/stage.module';
import { Stage } from '../stage/entities';

@Module({
  imports: [
    TypeOrmModule.forFeature([Hotel, Stage]),
    JwtModule.register({
      secret: process.env.JWT_ACCESS_TOKEN_KEY || 'SECRET',
      signOptions: { expiresIn: '24h' },
    }),
    forwardRef(() => StageModule),
  ],
  controllers: [HotelController],
  providers: [HotelService],
  exports: [HotelService],
})
export class HotelModule {}

import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';

import { SuperUserService } from './superUser.service';
import { SuperUserController } from './superUser.controller';
import { SuperUser } from './entities';
import { JwtModule } from '@nestjs/jwt';
import { TokenModule } from '../token/token.module';

@Module({
  imports: [
    TypeOrmModule.forFeature([SuperUser]),
    JwtModule.register({
      secret: process.env.JWT_ACCESS_TOKEN_KEY || 'SECRET',
      signOptions: { expiresIn: '24h' },
    }),
    TokenModule,
  ],
  controllers: [SuperUserController],
  providers: [SuperUserService],
  exports: [SuperUserService],
})
export class SuperUserModule {}

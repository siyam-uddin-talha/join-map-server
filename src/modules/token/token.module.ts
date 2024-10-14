import { Module } from '@nestjs/common';
import { JwtModule } from '@nestjs/jwt';
import { TypeOrmModule } from '@nestjs/typeorm';

import { TokenController } from './token.controller';
import { TokenService } from './token.service';
import { Token } from './entities';

@Module({
  imports: [
    TypeOrmModule.forFeature([Token]),
    JwtModule.register({
      secret: process.env.JWT_ACCESS_TOKEN_KEY || 'SECRET',
      signOptions: { expiresIn: '24h' },
    }),
  ],
  controllers: [TokenController],
  providers: [TokenService],
  exports: [TokenService, JwtModule],
})
export class TokenModule {}

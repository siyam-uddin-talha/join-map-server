import { forwardRef, Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';

import { AskChangeService } from './askChange.service';
import { AskChangeController } from './askChange.controller';
import { AskChange } from './entities';
import { JwtModule } from '@nestjs/jwt';
import { UserModule } from '../user/user.module';
import { WindowModule } from '../window/window.module';
import { User } from '../user/entities';
import { Window } from '../window/entities';

@Module({
  imports: [
    TypeOrmModule.forFeature([Window, User, AskChange]),
    JwtModule.register({
      secret: process.env.JWT_ACCESS_TOKEN_KEY || 'SECRET',
      signOptions: { expiresIn: '24h' },
    }),
    forwardRef(() => UserModule),
    forwardRef(() => WindowModule),
  ],
  controllers: [AskChangeController],
  providers: [AskChangeService],
  exports: [AskChangeService],
})
export class AskChangeModule {}

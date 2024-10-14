import { forwardRef, Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';

import { AskWorkService } from './askWork.service';
import { AskWorkController } from './askWork.controller';
import { AskWork } from './entities';
import { JwtModule } from '@nestjs/jwt';
import { UserModule } from '../user/user.module';
import { WindowModule } from '../window/window.module';
import { User } from '../user/entities';
import { Window } from '../window/entities';
import { WorkerModule } from '../worker/worker.module';

@Module({
  imports: [
    TypeOrmModule.forFeature([Window, User, AskWork]),
    JwtModule.register({
      secret: process.env.JWT_ACCESS_TOKEN_KEY || 'SECRET',
      signOptions: { expiresIn: '24h' },
    }),
    forwardRef(() => UserModule),
    forwardRef(() => WindowModule),
    forwardRef(() => WorkerModule),
  ],
  controllers: [AskWorkController],
  providers: [AskWorkService],
  exports: [AskWorkService],
})
export class AskWorkModule {}

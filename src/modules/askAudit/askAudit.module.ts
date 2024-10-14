import { forwardRef, Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';

import { AskAuditService } from './askAudit.service';
import { AskAuditController } from './askAudit.controller';
import { AskAudit } from './entities';
import { JwtModule } from '@nestjs/jwt';
import { UserModule } from '../user/user.module';
import { WindowModule } from '../window/window.module';
import { User } from '../user/entities';
import { Window } from '../window/entities';
import { WorkerModule } from '../worker/worker.module';

@Module({
  imports: [
    TypeOrmModule.forFeature([Window, User, AskAudit]),
    JwtModule.register({
      secret: process.env.JWT_ACCESS_TOKEN_KEY || 'SECRET',
      signOptions: { expiresIn: '24h' },
    }),
    forwardRef(() => UserModule),
    forwardRef(() => WindowModule),
    forwardRef(() => WorkerModule),
  ],
  controllers: [AskAuditController],
  providers: [AskAuditService],
  exports: [AskAuditService],
})
export class AskAuditModule {}

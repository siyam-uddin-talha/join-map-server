import { forwardRef, Module } from '@nestjs/common';
import { JwtModule } from '@nestjs/jwt';

import { AuthController } from './auth.controller';
import { AuthService } from './auth.service';
import { UserModule } from '../user/user.module';
import { TokenModule } from '../token/token.module';
import { WorkerModule } from '../worker/worker.module';
import { SuperUserModule } from '../superUser/superUser.module';

@Module({
  imports: [
    forwardRef(() => UserModule),
    forwardRef(() => WorkerModule),
    forwardRef(() => SuperUserModule),
    JwtModule.register({
      secret: process.env.JWT_ACCESS_TOKEN_KEY || 'SECRET',
      signOptions: { expiresIn: '24h' },
    }),
    TokenModule,
  ],
  controllers: [AuthController],
  providers: [AuthService],
  exports: [AuthService, JwtModule],
})
export class AuthModule {}

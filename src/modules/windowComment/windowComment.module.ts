import { forwardRef, Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';

import { WindowCommentService } from './windowComment.service';
import { WindowCommentController } from './windowComment.controller';
import { WindowComment } from './entities';
import { JwtModule } from '@nestjs/jwt';
import { UserModule } from '../user/user.module';
import { WindowModule } from '../window/window.module';
import { User } from '../user/entities';
import { Window } from '../window/entities';

@Module({
  imports: [
    TypeOrmModule.forFeature([Window, User, WindowComment]),
    JwtModule.register({
      secret: process.env.JWT_ACCESS_TOKEN_KEY || 'SECRET',
      signOptions: { expiresIn: '24h' },
    }),
    forwardRef(() => UserModule),
    forwardRef(() => WindowModule),
  ],
  controllers: [WindowCommentController],
  providers: [WindowCommentService],
  exports: [WindowCommentService],
})
export class WindowCommentModule {}

import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { ConfigModule, ConfigService } from '@nestjs/config';
import { MailerModule } from '@nestjs-modules/mailer';
import { HandlebarsAdapter } from '@nestjs-modules/mailer/dist/adapters/handlebars.adapter';
import { APP_GUARD } from '@nestjs/core';

import { join } from 'path';
import { UserModule } from './modules/user/user.module';
import { AuthModule } from './modules/auth/auth.module';
import { TokenModule } from './modules/token/token.module';
import { HotelModule } from './modules/hotel/hotel.module';
import { StageModule } from './modules/stage/stage.module';
import { RoomModule } from './modules/room/room.module';
import { WindowModule } from './modules/window/window.module';
import { AskWorkModule } from './modules/askWork/askWork.module';
import { AskAuditModule } from './modules/askAudit/askAudit.module';
import { AskChangeModule } from './modules/askChange/askChange.module';
import { WindowCommentModule } from './modules/windowComment/windowComment.module';
import { SuperUserModule } from './modules/superUser/superUser.module';
import { WorkerModule } from './modules/worker/worker.module';
import { RolesGuard } from './modules/auth/roles.guard';
import { DownloadController } from './modules/download/download.controller';
require('dotenv').config();

console.log(process.env.DATABASE_NAME, '-----');

@Module({
  imports: [
    TypeOrmModule.forRootAsync({
      imports: [ConfigModule],
      inject: [ConfigService],
      useFactory: async (config: ConfigService) => ({
        type: 'postgres',
        host: config.get<string>('DATABASE_HOST'),
        port: config.get<number>('DATABASE_PORT'),
        username: config.get<string>('DATABASE_USERNAME'),
        password: config.get<string>('DATABASE_PASSWORD'),
        database: config.get<string>('DATABASE_NAME'),
        entities: ['dist/**/*.entity{.ts,.js}'],
        migrations: ['dist/db/migrations/*.js'],
        cli: { migrationsDir: 'src/db/migrations' },
        synchronize: true,
        logging: true,
        logger: 'file',
        // ssl: { rejectUnauthorized: false },
      }),
    }),
    ConfigModule.forRoot({
      isGlobal: true,
      envFilePath: '.env',
    }),
    MailerModule.forRootAsync({
      imports: [ConfigModule],
      inject: [ConfigService],
      useFactory: async (config: ConfigService) => ({
        transport: {
          host: config.get<string>('SMTP_HOST'),
          port: config.get<number>('SMTP_PORT'),
          secure: false,
          auth: {
            user: config.get<string>('SMTP_USERNAME'),
            pass: config.get<string>('SMTP_PASSWORD'),
          },
        },
        defaults: {
          from: 'Join Map App <joinmap@outlook.com>',
        },
        template: {
          dir: join(__dirname, 'templates'),
          adapter: new HandlebarsAdapter(),
          options: {
            strict: true,
          },
        },
      }),
    }),
    UserModule,
    AuthModule,
    TokenModule,
    HotelModule,
    StageModule,
    RoomModule,
    WindowModule,
    AskWorkModule,
    AskAuditModule,
    AskChangeModule,
    WindowCommentModule,
    WorkerModule,
    SuperUserModule,
  ],
  controllers: [DownloadController],
  providers: [
    {
      provide: APP_GUARD,
      useClass: RolesGuard,
    },
  ],
})
export class AppModule {}

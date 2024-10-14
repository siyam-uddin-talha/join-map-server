import { NestFactory } from '@nestjs/core';
import { Logger } from '@nestjs/common';
import { NestExpressApplication } from '@nestjs/platform-express';
import { join } from 'path';
import * as basicAuth from 'express-basic-auth';

import { AppModule } from './app.module';
import { initSwagger } from './app.swagger';

async function bootstrap() {
  const app = await NestFactory.create<NestExpressApplication>(AppModule);
  const logger = new Logger('Bootstrap');
  app.useStaticAssets(join(__dirname, '../upload'));

  app.enableCors();
  app.setGlobalPrefix('api');
  app.use(
    ['/api/docs'],
    basicAuth({
      challenge: true,
      users: {
        [process.env.SWAGGER_USER]: process.env.SWAGGER_PASSWORD,
      },
    }),
  );

  initSwagger(app);

  await app.listen(process.env.PORT || 5000);
  logger.log(`Server is running at ${await app.getUrl()}`);
}
bootstrap();

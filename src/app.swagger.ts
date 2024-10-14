import { DocumentBuilder, SwaggerModule } from '@nestjs/swagger';
import { INestApplication } from '@nestjs/common';

export const initSwagger = (app: INestApplication) => {
  const config = new DocumentBuilder()
    .setTitle('JoinMap')
    .setDescription('JoinMap api documentation')
    .setVersion('1.0.0')
    .addTag('REST API')
    .build();

  const document = SwaggerModule.createDocument(app, config);
  SwaggerModule.setup('/api/docs', app, document);
};

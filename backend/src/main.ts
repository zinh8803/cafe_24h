import { NestFactory } from '@nestjs/core';
import { AppModule } from './app.module';

async function bootstrap() {
  const app = await NestFactory.create(AppModule);
  app.setGlobalPrefix('api');
  app.enableCors({
    origin: '*',
    credentials: true,
  });

  const port = Number(process.env.PORT) || 3001;
  await app.listen(port);
  console.log(`☕ 24h Café Backend listening on http://localhost:${port}`);
}
bootstrap();


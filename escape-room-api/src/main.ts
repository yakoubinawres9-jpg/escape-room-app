import * as dotenv from 'dotenv';
dotenv.config();  // <-- add this line BEFORE creating the app

import { NestFactory } from '@nestjs/core';
import { AppModule } from './app.module';

async function bootstrap() {
  const app = await NestFactory.create(AppModule);
  app.enableCors();
  console.log('OPENAI KEY:', process.env.OPENAI_API_KEY); 
  await app.listen(3001);
}
bootstrap();

import { Module } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config'; // 👈 Import this
import { AppController } from './app.controller';
import { AppService } from './app.service';
import { EscapeModule } from './escape/escape.module';

@Module({
  imports: [
    ConfigModule.forRoot({ isGlobal: true }), // 👈 Add this line
    EscapeModule
  ],
  controllers: [AppController],
  providers: [AppService],
})
export class AppModule {}
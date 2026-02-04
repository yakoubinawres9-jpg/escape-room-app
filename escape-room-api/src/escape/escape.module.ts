import { Module } from '@nestjs/common';
import { EscapeController } from './escape.controller';
import { EscapeService } from './escape.service';

@Module({
  controllers: [EscapeController],
  providers: [EscapeService]
})
export class EscapeModule {}

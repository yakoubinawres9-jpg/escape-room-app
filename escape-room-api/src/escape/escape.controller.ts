import { Controller, Get, Post, Body, Query } from '@nestjs/common';
import { EscapeService } from './escape.service';

@Controller('escape')
export class EscapeController {
  constructor(private readonly escapeService: EscapeService) {}

  @Get('riddle')
  getRiddle(
    @Query('level') level: string,
    @Query('theme') theme?: string,
    @Query('difficulty') difficulty?: string
  ) {
    return this.escapeService.getRiddle(Number(level), theme, difficulty);
  }

  @Post('answer')
  async submitAnswer(
    @Body() body: { level: number; riddle: string; answer: string }
  ) {
    return await this.escapeService.checkAnswer(
      body.level,
      body.riddle,
      body.answer
    );
  }
  @Get('hint')
getHint(@Query('riddle') riddle: string) {
  const hint = this.escapeService.getHint(riddle);
  return { hint };
}

}

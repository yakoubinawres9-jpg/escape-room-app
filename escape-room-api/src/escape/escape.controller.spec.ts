import { Test, TestingModule } from '@nestjs/testing';
import { EscapeController } from './escape.controller';

describe('EscapeController', () => {
  let controller: EscapeController;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      controllers: [EscapeController],
    }).compile();

    controller = module.get<EscapeController>(EscapeController);
  });

  it('should be defined', () => {
    expect(controller).toBeDefined();
  });
});

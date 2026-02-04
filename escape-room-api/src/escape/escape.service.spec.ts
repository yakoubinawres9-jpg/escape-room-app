import { Test, TestingModule } from '@nestjs/testing';
import { EscapeService } from './escape.service';

describe('EscapeService', () => {
  let service: EscapeService;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [EscapeService],
    }).compile();

    service = module.get<EscapeService>(EscapeService);
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });
});

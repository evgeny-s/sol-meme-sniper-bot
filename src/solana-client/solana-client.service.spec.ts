import { Test, TestingModule } from '@nestjs/testing';
import { SolanaClientService } from './solana-client.service';

describe('SolanaClientService', () => {
  let service: SolanaClientService;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [SolanaClientService],
    }).compile();

    service = module.get<SolanaClientService>(SolanaClientService);
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });
});

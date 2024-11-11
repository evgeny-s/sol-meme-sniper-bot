import { Injectable } from '@nestjs/common';
import { PositionType } from './position.type';
import { Position } from './position.entity';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';

@Injectable()
export class PositionService {
  constructor(
    @InjectRepository(Position)
    private positionsRepository: Repository<Position>,
  ) {}

  public async create({ raydiumPool, amount }: PositionType): Promise<void> {
    const position = new Position();
    position.raydiumPool = raydiumPool;
    position.amount = amount;

    await this.positionsRepository.save(position);
  }
}

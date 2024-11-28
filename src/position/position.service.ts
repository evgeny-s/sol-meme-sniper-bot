import { Injectable } from '@nestjs/common';
import { PositionType } from './position.type';
import { Position } from './position.entity';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { StatusEnum } from './enum/status.enum';

@Injectable()
export class PositionService {
  constructor(
    @InjectRepository(Position)
    private positionsRepository: Repository<Position>,
  ) {}

  public async create({
    raydiumPool,
    amount,
    price,
  }: PositionType): Promise<Position> {
    const position = new Position();
    position.status = StatusEnum.NEW;
    position.raydiumPool = raydiumPool;
    position.amount = amount;
    position.price = price;

    return await this.positionsRepository.save(position);
  }

  public async updateStatus(position: Position, status: StatusEnum) {
    position.status = status;

    return this.positionsRepository.save(position);
  }

  public getAll(): Promise<Position[]> {
    return this.positionsRepository.find({
      order: { createdAt: 'DESC' },
    });
  }

  public getByStatus(status: StatusEnum): Promise<Position[]> {
    return this.positionsRepository.find({
      where: { status },
      order: { createdAt: 'DESC' },
    });
  }

  public getByPool(raydiumPool: string): Promise<Position[]> {
    return this.positionsRepository.find({
      where: { raydiumPool },
      order: { createdAt: 'DESC' },
    });
  }
}

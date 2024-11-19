import { IsNotEmpty, IsNumber } from 'class-validator';
import { Type } from 'class-transformer';

export class GetUserDto {
  @IsNumber()
  @IsNotEmpty()
  @Type(() => Number)
  public readonly id: number;
}

import { IsNotEmpty, IsNumber } from 'class-validator';
import { Type } from 'class-transformer';

export class DeleteUserDto {
  @IsNumber()
  @IsNotEmpty()
  @Type(() => Number)
  public readonly id: number;
}

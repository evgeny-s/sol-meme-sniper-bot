import { IsDate, IsNotEmpty, IsString, Length } from 'class-validator';
import { Type } from 'class-transformer';

export class UserDto {
  @IsString()
  @IsNotEmpty()
  @Length(3, 100)
  public readonly username: string;

  @IsDate()
  @IsNotEmpty()
  @Type(() => Date)
  public subscriptionExpiresAt: Date;
}

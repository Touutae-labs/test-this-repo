import { IsNotEmpty, IsNumber, IsPositive } from 'class-validator';

/**
 * DTO for creating a top-up request
 */
export class CreateTopupDto {
  @IsNumber()
  @IsPositive()
  @IsNotEmpty()
  amount: number;
}

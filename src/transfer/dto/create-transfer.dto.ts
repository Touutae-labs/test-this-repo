import { IsNotEmpty, IsNumber, IsPositive, IsString } from 'class-validator';

/**
 * DTO for creating a transfer request
 */
export class CreateTransferDto {
  @IsString()
  @IsNotEmpty()
  recipientUsername: string;

  @IsNumber()
  @IsPositive()
  @IsNotEmpty()
  amount: number;
}

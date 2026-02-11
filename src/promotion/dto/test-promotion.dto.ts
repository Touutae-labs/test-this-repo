import { IsNumber, IsString, IsOptional } from 'class-validator';

export class TestPromotionDto {
  @IsNumber()
  amount: number;

  @IsString()
  @IsOptional()
  userTier?: string;

  @IsString()
  @IsOptional()
  transactionType?: string;
}

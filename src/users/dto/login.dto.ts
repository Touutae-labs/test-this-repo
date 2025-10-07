import { IsNotEmpty, IsString } from 'class-validator';

/**
 * DTO for user login
 */
export class LoginDto {
  @IsString()
  @IsNotEmpty()
  username: string;

  @IsString()
  @IsNotEmpty()
  password: string;
}

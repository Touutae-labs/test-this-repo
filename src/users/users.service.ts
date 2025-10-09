import {
  Injectable,
  ConflictException,
  UnauthorizedException,
} from '@nestjs/common';
import { DatabaseService } from '../common/database.service';
import { CreateUserDto } from './dto/create-user.dto';
import { LoginDto } from './dto/login.dto';
import { User } from './entities/user.entity';
import * as bcrypt from 'bcrypt';
import { randomUUID } from 'crypto';

/**
 * Users Service
 * Handles user management logic
 *
 * CRITICAL PARTS TO IMPLEMENT:
 * 1. Proper password hashing validation in comparePassword()
 * 2. Secure API key generation mechanism in generateApiKey()
 * 3. Add password reset functionality
 * 4. Add email verification
 * 5. Add 2FA support
 */
@Injectable()
export class UsersService {
  constructor(private readonly databaseService: DatabaseService) {}

  /**
   * Register a new user
   *
   * CRITICAL: Implement proper validation and error handling
   */
  async register(
    createUserDto: CreateUserDto,
  ): Promise<{ user: User; apiKey: string }> {
    const existingUser = await this.databaseService.userRepository.findByUsername(
      createUserDto.username,
    );

    if (existingUser) {
      throw new ConflictException('Username already exists');
    }

    // Hash password
    // CRITICAL: Review salt rounds and hashing algorithm for production
    const hashedPassword = await bcrypt.hash(createUserDto.password, 10);

    const user = new User({
      id: randomUUID(),
      username: createUserDto.username,
      password: hashedPassword,
      balance: 0, // Initial balance
      createdAt: new Date(),
      updatedAt: new Date(),
    });

    await this.databaseService.userRepository.save(user);

    // Generate API key for authentication
    // CRITICAL: Implement secure API key generation
    const apiKey = this.generateApiKey();
    const expiresAt = new Date();
    expiresAt.setDate(expiresAt.getDate() + 30); // 30 days expiration
    await this.databaseService.apiKeyRepository.save(apiKey, user.id, expiresAt);

    // Remove password from response
    // eslint-disable-next-line @typescript-eslint/no-unused-vars
    const { password, ...userWithoutPassword } = user;

    return { user: userWithoutPassword as User, apiKey };
  }

  /**
   * Login user
   *
   * CRITICAL: Implement proper authentication logic
   */
  async login(loginDto: LoginDto): Promise<{ user: User; apiKey: string }> {
    const user = await this.databaseService.userRepository.findByUsername(loginDto.username);

    if (!user) {
      throw new UnauthorizedException('Invalid credentials');
    }

    // CRITICAL: Implement proper password comparison
    const isPasswordValid = await this.comparePassword(
      loginDto.password,
      user.password,
    );

    if (!isPasswordValid) {
      throw new UnauthorizedException('Invalid credentials');
    }

    // Generate new API key
    // CRITICAL: Consider using JWT tokens instead
    const apiKey = this.generateApiKey();
    const expiresAt = new Date();
    expiresAt.setDate(expiresAt.getDate() + 30); // 30 days expiration
    await this.databaseService.apiKeyRepository.save(apiKey, user.id, expiresAt);

    // Remove password from response
    // eslint-disable-next-line @typescript-eslint/no-unused-vars
    const { password, ...userWithoutPassword } = user;

    return { user: userWithoutPassword as User, apiKey };
  }

  /**
   * Get user by ID
   */
  async findById(userId: string): Promise<User | undefined> {
    return this.databaseService.userRepository.findById(userId);
  }

  /**
   * Compare password with hash
   *
   * CRITICAL: Implement this method
   */
  private async comparePassword(
    plainPassword: string,
    hashedPassword: string,
  ): Promise<boolean> {
    // CRITICAL: Implement password comparison logic
    return bcrypt.compare(plainPassword, hashedPassword);
  }

  /**
   * Generate API key
   *
   * CRITICAL: Implement secure API key generation
   * Consider using JWT tokens with expiration instead
   */
  private generateApiKey(): string {
    // CRITICAL: This is a simple implementation. Use a more secure method in production
    return `ewallet_${randomUUID().replace(/-/g, '')}`;
  }
}

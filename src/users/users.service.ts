import {
  Injectable,
  ConflictException,
  UnauthorizedException,
} from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { CreateUserDto } from './dto/create-user.dto';
import { LoginDto } from './dto/login.dto';
import { User } from './entities/user.entity';
import { ApiKey } from '../common/entities/api-key.entity';
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
  constructor(
    @InjectRepository(User)
    private readonly userRepository: Repository<User>,
    @InjectRepository(ApiKey)
    private readonly apiKeyRepository: Repository<ApiKey>,
  ) {}

  /**
   * Register a new user
   *
   * CRITICAL: Implement proper validation and error handling
   */
  async register(
    createUserDto: CreateUserDto,
  ): Promise<{ user: User; apiKey: string }> {
    const existingUser = await this.userRepository.findOne({
      where: { username: createUserDto.username },
    });

    if (existingUser) {
      throw new ConflictException('Username already exists');
    }

    // Hash password
    // CRITICAL: Review salt rounds and hashing algorithm for production
    const hashedPassword = await bcrypt.hash(createUserDto.password, 10);

    const user = this.userRepository.create({
      username: createUserDto.username,
      password: hashedPassword,
      balance: 0, // Initial balance
    });

    await this.userRepository.save(user);

    // Generate API key for authentication
    // CRITICAL: Implement secure API key generation
    const apiKeyValue = this.generateApiKey();
    const expiresAt = new Date();
    expiresAt.setDate(expiresAt.getDate() + 30); // 30 days expiration

    const apiKey = this.apiKeyRepository.create({
      key: apiKeyValue,
      userId: user.id,
      expiresAt,
    });
    await this.apiKeyRepository.save(apiKey);

    // Remove password from response
    // eslint-disable-next-line @typescript-eslint/no-unused-vars
    const { password, ...userWithoutPassword } = user;

    return { user: userWithoutPassword as User, apiKey: apiKeyValue };
  }

  /**
   * Login user
   *
   * CRITICAL: Implement proper authentication logic
   */
  async login(loginDto: LoginDto): Promise<{ user: User; apiKey: string }> {
    const user = await this.userRepository.findOne({
      where: { username: loginDto.username },
    });

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
    const apiKeyValue = this.generateApiKey();
    const expiresAt = new Date();
    expiresAt.setDate(expiresAt.getDate() + 30); // 30 days expiration

    const apiKey = this.apiKeyRepository.create({
      key: apiKeyValue,
      userId: user.id,
      expiresAt,
    });
    await this.apiKeyRepository.save(apiKey);

    // Remove password from response
    // eslint-disable-next-line @typescript-eslint/no-unused-vars
    const { password, ...userWithoutPassword } = user;

    return { user: userWithoutPassword as User, apiKey: apiKeyValue };
  }

  /**
   * Get user by ID
   */
  async findById(userId: string): Promise<User | null> {
    return this.userRepository.findOne({ where: { id: userId } });
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

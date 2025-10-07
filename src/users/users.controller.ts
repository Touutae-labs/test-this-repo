import { Controller, Post, Body, Get, UseGuards } from '@nestjs/common';
import { UsersService } from './users.service';
import { CreateUserDto } from './dto/create-user.dto';
import { LoginDto } from './dto/login.dto';
import { AuthGuard } from '../common/guards/auth.guard';
import { CurrentUser } from '../common/decorators/user.decorator';

/**
 * Users Controller
 * Handles user registration and authentication endpoints
 */
@Controller('users')
export class UsersController {
  constructor(private readonly usersService: UsersService) {}

  /**
   * Register a new user
   * POST /users/register
   */
  @Post('register')
  async register(@Body() createUserDto: CreateUserDto) {
    return this.usersService.register(createUserDto);
  }

  /**
   * Login user
   * POST /users/login
   */
  @Post('login')
  async login(@Body() loginDto: LoginDto) {
    return this.usersService.login(loginDto);
  }

  /**
   * Get current user profile
   * GET /users/me
   * Requires authentication
   */
  @Get('me')
  @UseGuards(AuthGuard)
  async getProfile(@CurrentUser() userId: string) {
    const user = await this.usersService.findById(userId);
    if (user) {
      const { password, ...userWithoutPassword } = user;
      return userWithoutPassword;
    }
    return null;
  }
}

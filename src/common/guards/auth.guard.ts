import {
  Injectable,
  CanActivate,
  ExecutionContext,
  UnauthorizedException,
} from '@nestjs/common';
import { ApiKeyRepository } from '../../repositories/api-key.repository';

/**
 * Authentication Guard
 *
 * Validates API key in the request header
 *
 * CRITICAL: Implement proper authentication mechanism
 * - Consider JWT tokens instead of simple API keys
 * - Add token expiration
 * - Add refresh token mechanism
 * - Add rate limiting
 */
@Injectable()
export class AuthGuard implements CanActivate {
  constructor(private readonly apiKeyRepository: ApiKeyRepository) {}

  async canActivate(context: ExecutionContext): Promise<boolean> {
    const request = context.switchToHttp().getRequest();
    const apiKey = request.headers['x-api-key'];

    if (!apiKey) {
      throw new UnauthorizedException('API key is required');
    }

    const userId = await this.apiKeyRepository.findUserIdByApiKey(apiKey);

    if (!userId) {
      throw new UnauthorizedException('Invalid API key');
    }

    // Attach user ID to request for use in controllers
    request.userId = userId;
    return true;
  }
}

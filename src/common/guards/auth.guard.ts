import { Injectable, CanActivate, ExecutionContext, UnauthorizedException } from '@nestjs/common';

/**
 * Simple Authentication Guard
 * 
 * TODO: Implement proper authentication with user repository
 * For now, this is a placeholder that accepts any API key
 */
@Injectable()
export class AuthGuard implements CanActivate {
  async canActivate(context: ExecutionContext): Promise<boolean> {
    const request = context.switchToHttp().getRequest();
    const apiKey = request.headers['x-api-key'];

    if (!apiKey) {
      throw new UnauthorizedException('API key is required');
    }

    // TODO: Implement proper API key validation
    // For now, generate a dummy user ID based on the API key
    const userId = `user-${apiKey.slice(-8)}`;
    
    // Attach userId to request for use in controllers
    request.userId = userId;
    return true;
  }
}

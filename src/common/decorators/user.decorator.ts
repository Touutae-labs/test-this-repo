import { createParamDecorator, ExecutionContext } from '@nestjs/common';

/**
 * User Decorator
 * Extracts the authenticated user ID from the request
 */
export const CurrentUser = createParamDecorator(
  (data: unknown, ctx: ExecutionContext) => {
    const request = ctx.switchToHttp().getRequest();
    return request.userId;
  },
);

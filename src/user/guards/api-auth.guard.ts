import { Injectable, CanActivate, ExecutionContext } from '@nestjs/common';

@Injectable()
export class ApiAuthGuard implements CanActivate {
  public constructor() {}

  public canActivate(context: ExecutionContext): boolean {
    const request = context.switchToHttp().getRequest();
    const authHeader = request.headers.authorization;
    const authKey = process.env.API_KEY;

    return authHeader && authKey && authHeader === authKey;
  }
}

import {
  CanActivate,
  ExecutionContext,
  Injectable,
  UnauthorizedException,
} from '@nestjs/common';
import { Request } from 'express';
import { AuthService } from './auth.service';

@Injectable()
export class JwtAuthGuard implements CanActivate {
  constructor(private readonly authService: AuthService) {}

  async canActivate(context: ExecutionContext): Promise<boolean> {
    const req = context.switchToHttp().getRequest<Request>();
    const header = req.headers.authorization ?? '';
    const [type, token] = header.split(' ');
    if (type !== 'Bearer' || !token) {
      throw new UnauthorizedException('Missing bearer token');
    }
    // 검증된 사용자 정보를 req.user에 주입
    (req as Request & { user?: unknown }).user =
      await this.authService.verifyToken(token);
    return true;
  }
}

import {
  CanActivate,
  ExecutionContext,
  Injectable,
  UnauthorizedException,
} from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import { Observable } from 'rxjs';

import { RESPONSE_MESSAGES } from 'src/constants/messages';

@Injectable()
export class JwtAuthGuard implements CanActivate {
  constructor(private jwtService: JwtService) {}

  canActivate(
    context: ExecutionContext,
  ): boolean | Promise<boolean> | Observable<boolean> {
    const request = context.switchToHttp().getRequest();

    try {
      const authHeader = request.headers.authorization;
      const bearer = authHeader.split(' ')[0];
      const token = authHeader.split(' ')[1];

      if (bearer !== 'Bearer' || !token) {
        throw new UnauthorizedException({
          message: RESPONSE_MESSAGES.NOT_AUTHORIZED,
        });
      }

      request.user = this.jwtService.verify(token);

      return true;
    } catch (error) {
      throw new UnauthorizedException({
        message: RESPONSE_MESSAGES.NOT_AUTHORIZED,
      });
    }
  }
}

import {
  CanActivate,
  ExecutionContext,
  Injectable,
  UnauthorizedException,
  ForbiddenException,
} from '@nestjs/common';
import { Reflector } from '@nestjs/core';
import { JwtService } from '@nestjs/jwt';
import { Observable } from 'rxjs';
import { RESPONSE_MESSAGES } from 'src/constants/messages';

import { ROLES_KEY } from './roles.auth.decorator';

@Injectable()
export class RolesGuard implements CanActivate {
  constructor(private jwtService: JwtService, private reflector: Reflector) {}

  private matchRoles(roles: Array<string>, userRole: string) {
    return roles.some((role) => role === userRole);
  }

  canActivate(
    context: ExecutionContext,
  ): boolean | Promise<boolean> | Observable<boolean> {
    const request = context.switchToHttp().getRequest();

    try {
      const roles = this.reflector.get<string[]>(
        ROLES_KEY,
        context.getHandler(),
      );

      if (!roles) {
        return true;
      }

      const authHeader = request.headers.authorization;
      const bearer = authHeader.split(' ')[0];
      const token = authHeader.split(' ')[1];

      if (bearer !== 'Bearer' || !token) {
        throw new UnauthorizedException({
          message: RESPONSE_MESSAGES.NOT_AUTHORIZED,
        });
      }

      const user = this.jwtService.verify(token);
      request.user = user;

      return this.matchRoles(roles, user.role);
    } catch (error) {
      throw new ForbiddenException({
        message: RESPONSE_MESSAGES.NO_PERMISSION,
      });
    }
  }
}

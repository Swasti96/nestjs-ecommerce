import {
  Injectable,
  CanActivate,
  ExecutionContext,
  UnauthorizedException,
} from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import { ConfigService } from '@nestjs/config';
import { TokenExpiredError } from 'jsonwebtoken';
import { UserService } from 'src/api/user/services/user.service';
import { errorMessages } from 'src/errors/custom';

@Injectable()
export class AuthGuard implements CanActivate {
  constructor(
    private readonly jwtService: JwtService,
    private readonly userService: UserService,
    private readonly configService: ConfigService,
  ) {}

  async canActivate(context: ExecutionContext): Promise<boolean> {
  try {
    const request = context.switchToHttp().getRequest();
    const authHeader = request.headers.authorization;
    if (!authHeader)
      throw new UnauthorizedException(errorMessages.auth.invlidToken);

    const bearerToken = authHeader.split(' ')[1];
    const payload = await this.jwtService.verifyAsync(bearerToken, {
      secret: this.configService.get('jwt.secret'),
    });
    request.user = await this.userService.findById(payload.id, {
      roles: true,
    });
    return true;
  } catch (error) {
    if (error instanceof TokenExpiredError)
      throw new UnauthorizedException(errorMessages.auth.expiredToken);
    throw new UnauthorizedException(errorMessages.auth.invlidToken);
  }
}
}

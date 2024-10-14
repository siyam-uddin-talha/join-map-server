import { BadRequestException, Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { JwtService } from '@nestjs/jwt';
import { ConfigService } from '@nestjs/config';
import { Repository } from 'typeorm';

import { Token } from './entities';
import { User } from '../user/entities';
import { Worker } from '../worker/entities';
import { SuperUser } from '../superUser/entities';

@Injectable()
export class TokenService {
  private readonly JWTRefreshToken: string;

  constructor(
    @InjectRepository(Token)
    private readonly tokenRepository: Repository<Token>,
    private readonly jwtService: JwtService,
    private readonly configService: ConfigService,
  ) {
    this.JWTRefreshToken = this.configService.get<string>(
      'JWT_REFRESH_TOKEN_KEY',
    );
  }

  public async generateToken(
    user: User | Worker | SuperUser,
    options = {},
    role: string,
  ) {
    const { id, email } = user;
    const payload = { id, email, role };

    return this.jwtService.sign(payload, options);
  }

  public async validateToken(token: string, secret: string) {
    const user = this.jwtService.verify(token, { secret });

    if (user) return user;

    throw new BadRequestException('Token expired or invalid');
  }

  public async generateTokens(user: User | Worker | SuperUser, role: string) {
    const payload = { ...user };

    const accessToken = this.jwtService.sign({
      email: payload.email,
      id: payload.id,
      role,
    });
    const refreshToken = this.jwtService.sign(payload, {
      secret: this.JWTRefreshToken,
      expiresIn: '30d',
    });

    return { accessToken, refreshToken };
  }

  public async create(userId: string, refreshToken: string): Promise<Token> {
    const existingToken = await this.tokenRepository.findOne({
      where: { userId },
    });

    if (existingToken) {
      const updatedToken = Object.assign(existingToken, {
        token: refreshToken,
      });

      return await this.tokenRepository.save(updatedToken);
    }

    const token = this.tokenRepository.create({
      token: refreshToken,
      userId,
    });

    return await this.tokenRepository.save(token);
  }

  public async get(refreshToken: string): Promise<Token> {
    return await this.tokenRepository.findOne({
      where: { token: refreshToken },
    });
  }

  public async delete(refreshToken: string) {
    return await this.tokenRepository.delete({ token: refreshToken });
  }
}

import {
  BadRequestException,
  Injectable,
  NotFoundException,
  UnauthorizedException,
} from '@nestjs/common';
import { MailerService } from '@nestjs-modules/mailer';
import { ConfigService } from '@nestjs/config';
import * as bcrypt from 'bcryptjs';

import { LoginUserDTO } from './dto/login-user.dto';
import { RegisterUserDTO } from './dto/register-user.dto';
import { ResetPasswordDTO } from './dto/reset-password.dto';
import { RESPONSE_MESSAGES } from 'src/constants/messages';
import { UserService } from '../user/user.service';
import { TokenService } from '../token/token.service';
import { WorkerService } from '../worker/worker.service';
import { ResetWorkerPasswordDTO } from './dto/reset-worker-password.dto';
import { JwtService } from '@nestjs/jwt';
import { SuperUserService } from '../superUser/superUser.service';
import { ResetSuperUserPasswordDTO } from './dto/reset-super-user-password.dto';

@Injectable()
export class AuthService {
  private readonly JWTRefreshToken: string;
  private readonly JWTConfirmToken: string;
  private readonly JWTResetToken: string;
  private readonly clientURL: string;

  constructor(
    private readonly userService: UserService,
    private readonly tokenService: TokenService,
    private readonly mailerService: MailerService,
    private readonly configService: ConfigService,
    private readonly workerService: WorkerService,
    private readonly superUserService: SuperUserService,
    private readonly jwtService: JwtService,
  ) {
    this.JWTRefreshToken = this.configService.get<string>(
      'JWT_REFRESH_TOKEN_KEY',
    );
    this.JWTConfirmToken = this.configService.get<string>(
      'JWT_CONFIRM_TOKEN_KEY',
    );
    this.JWTResetToken = this.configService.get<string>('JWT_RESET_TOKEN_KEY');
    this.clientURL = this.configService.get<string>('CLIENT_URL');
  }

  private async validateUser(data: LoginUserDTO) {
    const { email, password } = data;

    const user = await this.userService.getByEmail(email);
    const worker = await this.workerService.getByEmail(email);
    const superUser = await this.superUserService.getByEmail(email);

    console.log(user);

    if (user) {
      // if (!user.emailVerifiedAt) {
      //   throw new BadRequestException({
      //     message: RESPONSE_MESSAGES.EMAIL_NOT_VERIFIED,
      //   });
      // }
      const passwordEquals = await bcrypt.compare(password, user.password);

      if (passwordEquals) {
        return {
          userInfo: user,
          role: 'user',
        };
      }
    } else if (worker) {
      if (!worker.otpVerifiedAt || !worker.password) {
        const passwordEquals = await bcrypt.compare(password, worker.otp);
        const data: any = { otpVerifiedAt: new Date(Date.now()).toISOString() };
        if (passwordEquals) {
          const updatedWorker = await this.workerService.update(
            worker.id,
            data,
          );

          return {
            userInfo: updatedWorker,
            role: 'worker',
            isFirstLogin: true,
          };
        } else {
          throw new BadRequestException({
            message: RESPONSE_MESSAGES.OTP_WRONG,
          });
        }
      } else {
        const passwordEquals = await bcrypt.compare(password, worker.password);

        if (passwordEquals) {
          return {
            userInfo: worker,
            role: 'worker',
          };
        } else {
          throw new BadRequestException({
            message: RESPONSE_MESSAGES.PASSWORD_WRONG,
          });
        }
      }
    } else if (superUser) {
      if (!superUser.otpVerifiedAt || !superUser.password) {
        const passwordEquals = await bcrypt.compare(password, superUser.otp);
        const data: any = { otpVerifiedAt: new Date(Date.now()).toISOString() };
        if (passwordEquals) {
          const updatedSuperUser = await this.superUserService.update(
            superUser.id,
            data,
          );

          return {
            userInfo: updatedSuperUser,
            role: 'super_user',
            isFirstLogin: true,
          };
        } else {
          throw new BadRequestException({
            message: RESPONSE_MESSAGES.OTP_WRONG,
          });
        }
      } else {
        const passwordEquals = await bcrypt.compare(
          password,
          superUser.password,
        );

        if (passwordEquals) {
          return {
            userInfo: superUser,
            role: 'super_user',
          };
        } else {
          throw new BadRequestException({
            message: RESPONSE_MESSAGES.PASSWORD_WRONG,
          });
        }
      }
    } else {
      throw new UnauthorizedException({
        message: RESPONSE_MESSAGES.NOT_AUTHORIZED,
      });
    }
  }

  public async login(data: LoginUserDTO) {
    const user = await this.validateUser(data);

    const { accessToken, refreshToken } =
      await this.tokenService.generateTokens(user.userInfo, user.role);

    await this.tokenService.create(user.userInfo.id, refreshToken);

    return {
      accessToken,
      refreshToken,
      role: user.role,
      isFirstLogin: user.isFirstLogin,
    };
  }

  public async register(data: RegisterUserDTO) {
    const { email, password } = data;

    const candidate = await this.userService.getByEmail(email);

    if (candidate) {
      throw new BadRequestException({
        message: RESPONSE_MESSAGES.EMAIL_ALREADY_EXISTS,
      });
    }

    const hashPassword = await bcrypt.hash(password, 5);
    const user = await this.userService.create({
      ...data,
      password: hashPassword,
    });

    const confirmToken = await this.tokenService.generateToken(
      user,
      {
        secret: this.JWTConfirmToken,
        expiresIn: '10d',
      },
      'user',
    );

    await this.mailerService.sendMail({
      to: user.email,
      subject: 'Join Map - Verify your email',
      html: `<a href="${this.clientURL}/confirm-email?confirmToken=${confirmToken}">Click here to activate</a>`,
    });
    console.log(`${this.clientURL}/confirm-email?confirmToken=${confirmToken}`);

    const { refreshToken } = await this.tokenService.generateTokens(
      user,
      'user',
    );

    await this.tokenService.create(user.id, refreshToken);
  }

  public async logout(refreshToken: string) {
    return await this.tokenService.delete(refreshToken);
  }

  public async refresh(refreshToken: string) {
    if (!refreshToken) {
      throw new UnauthorizedException({
        message: RESPONSE_MESSAGES.NOT_AUTHORIZED,
      });
    }

    const payload = await this.tokenService.validateToken(
      refreshToken,
      this.JWTRefreshToken,
    );
    const savedToken = await this.tokenService.get(refreshToken);

    if (!payload || !savedToken) {
      throw new UnauthorizedException({
        message: RESPONSE_MESSAGES.NOT_AUTHORIZED,
      });
    }

    const user = await this.userService.getById(payload.id);
    const worker = await this.workerService.getById(payload.id);
    const superUser = await this.superUserService.getById(payload.id);

    if (user) {
      const tokens = await this.tokenService.generateTokens(user, 'user');

      await this.tokenService.create(user.id, tokens.refreshToken);

      return { ...tokens, userId: user.id };
    } else if (worker) {
      const tokens = await this.tokenService.generateTokens(worker, 'worker');

      await this.tokenService.create(worker.id, tokens.refreshToken);

      return { ...tokens, userId: worker.id };
    } else if (superUser) {
      const tokens = await this.tokenService.generateTokens(
        superUser,
        'super_user',
      );

      await this.tokenService.create(superUser.id, tokens.refreshToken);

      return { ...tokens, userId: superUser.id };
    }
  }

  public async forgotPassword(email: string) {
    const user = await this.userService.getByEmail(email);
    const worker = await this.workerService.getByEmail(email);
    const superUser = await this.superUserService.getByEmail(email);

    if (!user && !worker && !superUser) {
      throw new BadRequestException({ message: 'Email not registered' });
    }

    if (user) {
      const resetToken = await this.tokenService.generateToken(
        user,
        {
          secret: this.JWTResetToken,
          expiresIn: '10d',
        },
        'user',
      );

      // await this.mailerService.sendMail({
      //   to: user.email,
      //   subject: 'Join Map - reset password',
      //   html: `<a href="${this.clientURL}/reset-password?resetToken=${resetToken}">Click here to reset password</a>`,
      // });
      console.log(`${this.clientURL}/reset-password?resetToken=${resetToken}`);
    } else if (worker) {
      const resetToken = await this.tokenService.generateToken(
        worker,
        {
          secret: this.JWTResetToken,
          expiresIn: '10d',
        },
        'worker',
      );

      // await this.mailerService.sendMail({
      //   to: worker.email,
      //   subject: 'Join Map - reset password',
      //   html: `<a href="${this.clientURL}/reset-password?resetToken=${resetToken}">Click here to reset password</a>`,
      // });
      console.log(`${this.clientURL}/reset-password?resetToken=${resetToken}`);
    } else if (superUser) {
      const resetToken = await this.tokenService.generateToken(
        superUser,
        {
          secret: this.JWTResetToken,
          expiresIn: '10d',
        },
        'super_user',
      );

      // await this.mailerService.sendMail({
      //   to: superUser.email,
      //   subject: 'Join Map - reset password',
      //   html: `<a href="${this.clientURL}/reset-password?resetToken=${resetToken}">Click here to reset password</a>`,
      // });
      console.log(`${this.clientURL}/reset-password?resetToken=${resetToken}`);
    }
  }

  public async resetPassword(data: ResetPasswordDTO) {
    const { password, resetToken } = data;

    const payload = await this.tokenService.validateToken(
      resetToken,
      this.JWTResetToken,
    );
    const hashPassword = await bcrypt.hash(password, 5);

    if (payload.role === 'user') {
      await this.userService.updatePassword(payload.id, hashPassword);
    } else if (payload.role === 'worker') {
      await this.workerService.updatePassword(payload.id, hashPassword);
    } else if (payload.role === 'super_user') {
      await this.superUserService.updatePassword(payload.id, hashPassword);
    }

    return { message: 'Password successfully updated' };
  }

  public async resetWorkerPassword(data: ResetWorkerPasswordDTO) {
    const { newPassword, token } = data;
    const worker = this.jwtService.verify(token);
    const hashPassword = await bcrypt.hash(newPassword, 5);
    await this.workerService.updatePassword(worker.id, hashPassword);

    return { message: 'Password successfully updated' };
  }

  public async resetSuperUserPassword(data: ResetSuperUserPasswordDTO) {
    const { newPassword, token } = data;
    const superUser = this.jwtService.verify(token);
    const hashPassword = await bcrypt.hash(newPassword, 5);
    await this.superUserService.updatePassword(superUser.id, hashPassword);

    return { message: 'Password successfully updated' };
  }

  public async getMe(account: any) {
    if (account.role === 'worker') {
      const worker = await this.workerService.getById(account.id);
      if (!worker) {
        throw new NotFoundException(RESPONSE_MESSAGES.WORKER_NOT_FOUND);
      } else {
        return {
          name: worker.name,
          role: 'worker',
        };
      }
    } else if (account.role === 'user') {
      const user = await this.userService.getById(account.id);
      if (!user) {
        throw new NotFoundException(RESPONSE_MESSAGES.USER_NOT_FOUND);
      }
      return {
        name: user.firstName + ' ' + user.lastName,
        email: user.email,
        image: user.image,
        role: user.role,
        firstName: user.firstName,
        lastName: user.lastName,
        id: user.id,
      };
    } else if (account.role === 'super_user') {
      const superUser = await this.superUserService.getById(account.id);
      if (!superUser) {
        throw new NotFoundException(RESPONSE_MESSAGES.USER_NOT_FOUND);
      }
      return {
        name: superUser.name,
        role: 'super_user',
      };
    }
  }

  public async confirmEmail(confirmToken: string) {
    const payload = await this.tokenService.validateToken(
      confirmToken,
      this.JWTConfirmToken,
    );

    const userId = await this.userService.updateEmailVerifiedAt(payload.id);
    const user = await this.userService.getById(userId);

    const { accessToken, refreshToken } =
      await this.tokenService.generateTokens(user, 'user');

    await this.tokenService.create(user.id, refreshToken);

    return { accessToken, refreshToken, userId: user.id };
  }
}

import {
  Body,
  Controller,
  HttpStatus,
  Post,
  Res,
  Get,
  UseGuards,
  Request,
} from '@nestjs/common';
import {
  ApiCreatedResponse,
  ApiOperation,
  ApiResponse,
  ApiTags,
} from '@nestjs/swagger';
import { Response } from 'express';

import { AuthService } from './auth.service';
import { LoginUserDTO } from './dto/login-user.dto';
import { RegisterUserDTO } from './dto/register-user.dto';
import { ForgotPasswordDTO } from './dto/forgot-password.dto';
import { ResetPasswordDTO } from './dto/reset-password.dto';
import { JwtAuthGuard } from './jwt-auth.guard';
import { ResetWorkerPasswordDTO } from './dto/reset-worker-password.dto';
import { ResetSuperUserPasswordDTO } from './dto/reset-super-user-password.dto';

@ApiTags('Authentication')
@Controller('auth')
export class AuthController {
  constructor(private authService: AuthService) {}

  @ApiOperation({ summary: 'Login user' })
  @ApiResponse({
    status: 200,
    description: 'The user has been successfully login',
  })
  @Post('/login')
  login(@Body() data: LoginUserDTO) {
    return this.authService.login(data);
  }

  @ApiOperation({ summary: 'Register user' })
  @ApiCreatedResponse({
    description: 'The user has been successfully created',
  })
  @Post('/register')
  async register(@Body() data: RegisterUserDTO, @Res() res: Response) {
    await this.authService.register(data);
    return res.status(HttpStatus.CREATED).send({
      success: true,
      msg: 'Please check your email to activate your account.',
    });
  }

  @ApiOperation({ summary: 'Logout user' })
  @ApiCreatedResponse({
    description: 'The user has been successfully logout',
  })
  @Post('/logout')
  logout(@Body() { refreshToken }) {
    return this.authService.logout(refreshToken);
  }

  @ApiOperation({ summary: 'Refresh token' })
  @ApiResponse({
    status: 200,
    description: 'The refresh token has been successfully updated',
  })
  @Post('/refresh-token')
  refresh(@Body() { refreshToken }) {
    return this.authService.refresh(refreshToken);
  }

  @ApiOperation({ summary: 'Confirm email' })
  @ApiResponse({
    status: 200,
    description: 'Email was successfully verified',
  })
  @Post('/confirm-email')
  confirmEmail(@Body() { confirmToken }) {
    return this.authService.confirmEmail(confirmToken);
  }

  @ApiOperation({ summary: 'Forgot password' })
  @ApiResponse({
    status: 200,
    description: 'Email with reset link sent',
  })
  @Post('/forgot-password')
  async forgotPassword(
    @Body() { email }: ForgotPasswordDTO,
    @Res() res: Response,
  ) {
    await this.authService.forgotPassword(email);
    return res
      .status(HttpStatus.OK)
      .send({ success: true, msg: 'Token sent to your email' });
  }

  @ApiOperation({ summary: 'Reset password' })
  @ApiResponse({
    status: 200,
    description: 'Password was successfully reset',
  })
  @Post('/reset-password')
  async resetPassword(@Body() data: ResetPasswordDTO, @Res() res: Response) {
    await this.authService.resetPassword(data);
    return res
      .status(HttpStatus.OK)
      .send({ success: true, msg: 'Password updated Successfully' });
  }

  @ApiOperation({ summary: 'Reset worker password' })
  @ApiResponse({
    status: 200,
    description: 'Worker Password was successfully reset',
  })
  @Post('/reset-worker-password')
  async resetWorkerPassword(
    @Body() data: ResetWorkerPasswordDTO,
    @Res() res: Response,
  ) {
    await this.authService.resetWorkerPassword(data);
    return res
      .status(HttpStatus.OK)
      .send({ success: true, msg: 'Worker password updated Successfully' });
  }

  @ApiOperation({ summary: 'Reset super user password' })
  @ApiResponse({
    status: 200,
    description: 'Super User Password was successfully reset',
  })
  @Post('/reset-super-user-password')
  async resetSuperUserPassword(
    @Body() data: ResetSuperUserPasswordDTO,
    @Res() res: Response,
  ) {
    await this.authService.resetSuperUserPassword(data);
    return res
      .status(HttpStatus.OK)
      .send({ success: true, msg: 'Super user password updated Successfully' });
  }

  @ApiOperation({ summary: 'Get me' })
  @ApiResponse({
    status: 200,
    description: 'Get me info successfully',
  })
  @UseGuards(JwtAuthGuard)
  @Get('/me')
  async getMe(@Request() req: any) {
    return this.authService.getMe(req.user);
  }
}

import {
  Controller,
  Get,
  Query,
  Req,
  Res,
  UseGuards,
} from '@nestjs/common';
import { ApiOperation, ApiQuery, ApiTags } from '@nestjs/swagger';
import type { Request, Response } from 'express';
import { UsersService } from '../users/users.service';
import { AuthService } from './auth.service';
import type { AuthUser } from './auth.service';
import { JwtAuthGuard } from './jwt-auth.guard';

@ApiTags('auth')
@Controller('auth')
export class AuthController {
  constructor(
    private readonly authService: AuthService,
    private readonly usersService: UsersService,
  ) {}

  @Get('google')
  @ApiOperation({
    summary: '구글 로그인 시작 — 구글 동의 화면으로 리다이렉트',
  })
  @ApiQuery({
    name: 'redirect_uri',
    required: false,
    description: '로그인 완료 후 토큰과 함께 돌아갈 프론트 주소 (예: http://localhost:3000/auth/callback)',
  })
  @ApiQuery({
    name: 'callback_url',
    required: false,
    description:
      '구글이 code를 보낼 백엔드 콜백 주소. 프론트가 자기 API_BASE로 만들어 전달 (예: http://localhost:4000/api/auth/google/callback). 구글 콘솔에 등록돼 있어야 함.',
  })
  googleAuth(
    @Query('redirect_uri') redirectUri: string,
    @Query('callback_url') callbackUrl: string,
    @Res() res: Response,
  ) {
    const url = this.authService.getGoogleAuthUrl(redirectUri, callbackUrl);
    res.redirect(url);
  }

  @Get('google/callback')
  @ApiOperation({ summary: '구글 콜백 — 토큰 발급 후 프론트로 리다이렉트' })
  async googleCallback(
    @Query('code') code: string,
    @Query('state') state: string,
    @Res() res: Response,
  ) {
    const { redirectUri, callbackUrl } = this.authService.decodeState(state);
    try {
      const token = await this.authService.handleGoogleCallback(
        code,
        callbackUrl,
      );
      const url = new URL(redirectUri);
      url.searchParams.set('token', token);
      res.redirect(url.toString());
    } catch {
      const url = new URL(redirectUri);
      url.searchParams.set('error', 'auth_failed');
      res.redirect(url.toString());
    }
  }

  @Get('me')
  @UseGuards(JwtAuthGuard)
  @ApiOperation({ summary: '현재 로그인 사용자 정보 (DB 조회, Bearer 토큰 필요)' })
  async me(@Req() req: Request & { user: AuthUser }) {
    const user = await this.usersService.findById(req.user.uid);
    if (!user) return req.user;
    return {
      id: user.id,
      email: user.email,
      name: user.name,
      picture: user.picture,
      createdAt: user.createdAt,
    };
  }
}

import {
  BadRequestException,
  Injectable,
  UnauthorizedException,
} from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { JwtService } from '@nestjs/jwt';

export interface AuthUser {
  sub: string; // google id
  email: string;
  name: string;
  picture: string;
}

interface OAuthState {
  /** 로그인 완료 후 돌아갈 프론트 주소 */
  redirectUri: string;
  /** 구글이 code를 보낼 백엔드 콜백 주소 (프론트가 전달) */
  callbackUrl: string;
}

@Injectable()
export class AuthService {
  constructor(
    private readonly config: ConfigService,
    private readonly jwt: JwtService,
  ) {}

  /**
   * 구글 동의 화면 URL 생성.
   * - callbackUrl: 구글이 code를 보낼 주소(=백엔드 콜백). 프론트가 자기 API_BASE로 만들어 전달.
   * - frontendRedirectUri: 로그인 완료 후 돌아갈 프론트 주소.
   * 둘 다 state에 실어 콜백에서 복원한다.
   */
  getGoogleAuthUrl(frontendRedirectUri: string, callbackUrl?: string): string {
    const clientId = this.config.get<string>('GOOGLE_CLIENT_ID');
    if (!clientId) throw new BadRequestException('GOOGLE_CLIENT_ID not set');

    const callback = this.resolveCallback(callbackUrl);
    const redirectUri = this.safeRedirect(frontendRedirectUri);

    const params = new URLSearchParams({
      client_id: clientId,
      redirect_uri: callback,
      response_type: 'code',
      scope: 'openid email profile',
      access_type: 'offline',
      prompt: 'select_account',
      state: this.encodeState({ redirectUri, callbackUrl: callback }),
    });
    return `https://accounts.google.com/o/oauth2/v2/auth?${params}`;
  }

  /**
   * 콜백: code를 토큰으로 교환 → 프로필 조회 → 앱 JWT 발급.
   * token 교환 시 redirect_uri는 동의 단계에서 쓴 callbackUrl과 정확히 일치해야 한다.
   */
  async handleGoogleCallback(code: string, callbackUrl: string): Promise<string> {
    const clientId = this.config.get<string>('GOOGLE_CLIENT_ID');
    const clientSecret = this.config.get<string>('GOOGLE_CLIENT_SECRET');
    if (!clientId || !clientSecret) {
      throw new BadRequestException('Google OAuth env not set');
    }

    const tokenRes = await fetch('https://oauth2.googleapis.com/token', {
      method: 'POST',
      headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
      body: new URLSearchParams({
        code,
        client_id: clientId,
        client_secret: clientSecret,
        redirect_uri: callbackUrl,
        grant_type: 'authorization_code',
      }),
    });

    if (!tokenRes.ok) {
      throw new UnauthorizedException('Google token exchange failed');
    }
    const tokens = (await tokenRes.json()) as { access_token?: string };
    if (!tokens.access_token) {
      throw new UnauthorizedException('No access_token from Google');
    }

    const userRes = await fetch(
      'https://www.googleapis.com/oauth2/v3/userinfo',
      { headers: { Authorization: `Bearer ${tokens.access_token}` } },
    );
    if (!userRes.ok) {
      throw new UnauthorizedException('Google userinfo failed');
    }
    const profile = (await userRes.json()) as {
      sub: string;
      email: string;
      name: string;
      picture: string;
    };

    return this.signToken({
      sub: profile.sub,
      email: profile.email,
      name: profile.name,
      picture: profile.picture,
    });
  }

  signToken(user: AuthUser): Promise<string> {
    return this.jwt.signAsync(user);
  }

  async verifyToken(token: string): Promise<AuthUser> {
    try {
      return await this.jwt.verifyAsync<AuthUser>(token);
    } catch {
      throw new UnauthorizedException('Invalid token');
    }
  }

  /** 프론트가 콜백 URL을 안 줬을 때만 env/기본값으로 폴백. */
  private resolveCallback(callbackUrl?: string): string {
    if (callbackUrl) return this.safeRedirect(callbackUrl);
    return (
      this.config.get<string>('GOOGLE_CALLBACK_URL') ??
      'http://localhost:4000/api/auth/google/callback'
    );
  }

  private frontendFallback(): string {
    return this.config.get<string>('FRONTEND_URL') ?? 'http://localhost:3000';
  }

  /** state(JSON)를 base64url로 인코딩. */
  encodeState(state: OAuthState): string {
    return Buffer.from(JSON.stringify(state), 'utf8').toString('base64url');
  }

  decodeState(state: string | undefined): OAuthState {
    const fallback: OAuthState = {
      redirectUri: `${this.frontendFallback()}/auth/callback`,
      callbackUrl: this.resolveCallback(),
    };
    if (!state) return fallback;
    try {
      const parsed = JSON.parse(
        Buffer.from(state, 'base64url').toString('utf8'),
      ) as Partial<OAuthState>;
      return {
        redirectUri: this.safeRedirect(parsed.redirectUri ?? fallback.redirectUri),
        callbackUrl: this.safeRedirect(parsed.callbackUrl ?? fallback.callbackUrl),
      };
    } catch {
      return fallback;
    }
  }

  /** http/https만 허용 (open redirect 방지). 아니면 프론트 폴백. */
  private safeRedirect(uri: string): string {
    try {
      const u = new URL(uri);
      if (u.protocol !== 'http:' && u.protocol !== 'https:') {
        return `${this.frontendFallback()}/auth/callback`;
      }
      return uri;
    } catch {
      return `${this.frontendFallback()}/auth/callback`;
    }
  }
}

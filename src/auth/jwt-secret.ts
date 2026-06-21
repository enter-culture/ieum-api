/**
 * JWT 서명/검증에 쓸 secret을 검증해 반환한다.
 *
 * 주의: `config.get('JWT_SECRET') ?? 'fallback'` 패턴은 빈 문자열("")을 거르지 못한다.
 * 환경변수 키는 있는데 값이 비어 있으면 "" 그대로 jwt.sign/verify에 넘어가
 * 매 요청마다 "secretOrPrivateKey must have a value" 런타임 에러가 난다.
 * 여기서 비어있거나 공백뿐인 secret을 기동 시점에 명확히 실패시켜
 * 설정 누락(로컬 .env / Render 대시보드)을 즉시 드러낸다.
 */
export function resolveJwtSecret(raw: string | undefined | null): string {
  const secret = raw?.trim();
  if (!secret) {
    throw new Error(
      'JWT_SECRET이 비어 있습니다. 비어있지 않은 값을 환경변수에 설정하세요 ' +
        '(로컬: .env, 배포: Render 대시보드).',
    );
  }
  return secret;
}

import { resolveJwtSecret } from './jwt-secret';

describe('resolveJwtSecret', () => {
  it('값이 있으면 trim해서 반환한다', () => {
    expect(resolveJwtSecret('  s3cr3t  ')).toBe('s3cr3t');
  });

  it('undefined면 throw한다', () => {
    expect(() => resolveJwtSecret(undefined)).toThrow(/JWT_SECRET/);
  });

  it('null이면 throw한다', () => {
    expect(() => resolveJwtSecret(null)).toThrow(/JWT_SECRET/);
  });

  it('빈 문자열이면 throw한다 (?? 가 못 거르던 케이스)', () => {
    expect(() => resolveJwtSecret('')).toThrow(/JWT_SECRET/);
  });

  it('공백만 있으면 throw한다', () => {
    expect(() => resolveJwtSecret('   ')).toThrow(/JWT_SECRET/);
  });
});

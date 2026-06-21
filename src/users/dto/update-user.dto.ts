import { ApiPropertyOptional } from '@nestjs/swagger';
import { IsOptional, IsString, MaxLength } from 'class-validator';

/** 프로필 부분 수정. 모든 필드 선택값. */
export class UpdateUserDto {
  @ApiPropertyOptional({ example: '이음러', description: '표시 이름(닉네임)' })
  @IsOptional()
  @IsString()
  @MaxLength(40)
  nickname?: string;

  @ApiPropertyOptional({ example: '전주', description: '관심 지역' })
  @IsOptional()
  @IsString()
  @MaxLength(40)
  region?: string;

  @ApiPropertyOptional({ example: '공예', description: '관심 카테고리' })
  @IsOptional()
  @IsString()
  @MaxLength(40)
  category?: string;

  @ApiPropertyOptional({
    example: 'https://pub-xxxx.r2.dev/avatars/123.jpg',
    description: '프로필 사진 URL (R2 업로드 후 공개 URL)',
  })
  @IsOptional()
  @IsString()
  @MaxLength(500)
  picture?: string;
}

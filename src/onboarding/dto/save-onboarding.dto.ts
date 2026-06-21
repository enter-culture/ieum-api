import { ApiProperty } from '@nestjs/swagger';
import { ArrayNotEmpty, IsArray, IsInt } from 'class-validator';

/** 온보딩 설문 저장(upsert). */
export class SaveOnboardingDto {
  @ApiProperty({ example: [1, 3], description: '관심 지역 id 목록' })
  @IsArray()
  @ArrayNotEmpty()
  @IsInt({ each: true })
  vibeList: number[];

  @ApiProperty({ example: [2, 5], description: '관심 카테고리 id 목록' })
  @IsArray()
  @ArrayNotEmpty()
  @IsInt({ each: true })
  placeCategoryList: number[];
}

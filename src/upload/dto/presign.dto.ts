import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { IsIn, IsNotEmpty, IsOptional, IsString } from 'class-validator';

/** 업로드 대상 폴더(프리픽스). 허용된 값만 사용 가능. */
export const UPLOAD_FOLDERS = ['shorts', 'avatars'] as const;
export type UploadFolder = (typeof UPLOAD_FOLDERS)[number];

export class PresignDto {
  @ApiProperty({ example: 'my-video.mp4' })
  @IsString()
  @IsNotEmpty()
  filename: string;

  @ApiProperty({ example: 'video/mp4' })
  @IsString()
  @IsNotEmpty()
  contentType: string;

  @ApiPropertyOptional({
    enum: UPLOAD_FOLDERS,
    example: 'avatars',
    description: 'R2 키 프리픽스 (기본: shorts)',
  })
  @IsOptional()
  @IsIn(UPLOAD_FOLDERS)
  folder?: UploadFolder;
}

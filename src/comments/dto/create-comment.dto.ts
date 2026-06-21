import { ApiProperty } from '@nestjs/swagger';
import { IsInt, IsNotEmpty, IsString, MaxLength } from 'class-validator';

export class CreateCommentDto {
  @ApiProperty({ description: '프론트 ShortsPlace.id' })
  @IsInt()
  shortsId: number;

  @ApiProperty({ description: '댓글 본문(최대 500자)' })
  @IsString()
  @IsNotEmpty()
  @MaxLength(500)
  content: string;
}

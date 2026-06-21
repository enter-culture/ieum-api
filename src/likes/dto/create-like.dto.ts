import { ApiProperty } from '@nestjs/swagger';
import {
  IsInt,
  IsNotEmpty,
  IsOptional,
  IsString,
} from 'class-validator';

export class CreateLikeDto {
  @ApiProperty({ description: '프론트 ShortsPlace.id' })
  @IsInt()
  shortsId: number;

  @ApiProperty()
  @IsString()
  @IsNotEmpty()
  title: string;

  @ApiProperty({ required: false })
  @IsOptional()
  @IsString()
  address?: string;

  @ApiProperty({ required: false })
  @IsOptional()
  @IsString()
  categoryHigh?: string;

  @ApiProperty({ required: false })
  @IsOptional()
  @IsString()
  videoSrc?: string;

  @ApiProperty({ required: false })
  @IsOptional()
  @IsString()
  heritageId?: string;
}

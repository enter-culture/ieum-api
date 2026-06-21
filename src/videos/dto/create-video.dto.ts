import { ApiProperty } from '@nestjs/swagger';
import { IsOptional, IsString, IsNotEmpty } from 'class-validator';

export class CreateVideoDto {
  @ApiProperty({ description: 'R2 객체 key (presign에서 받은 key)' })
  @IsString()
  @IsNotEmpty()
  r2Key: string;

  @ApiProperty()
  @IsString()
  @IsNotEmpty()
  title: string;

  @ApiProperty({ required: false })
  @IsOptional()
  @IsString()
  description?: string;

  @ApiProperty({ required: false })
  @IsOptional()
  @IsString()
  category?: string;

  @ApiProperty({ required: false })
  @IsOptional()
  @IsString()
  subCategory?: string;

  @ApiProperty({ required: false })
  @IsOptional()
  @IsString()
  region?: string;

  @ApiProperty({ required: false })
  @IsOptional()
  @IsString()
  heritageId?: string;

  @ApiProperty({ required: false })
  @IsOptional()
  @IsString()
  heritageAsno?: string;

  @ApiProperty({ required: false })
  @IsOptional()
  @IsString()
  heritageCtcd?: string;
}

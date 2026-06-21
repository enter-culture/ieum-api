import { Body, Controller, Post } from '@nestjs/common';
import { ApiOperation, ApiTags } from '@nestjs/swagger';
import { PresignDto } from './dto/presign.dto';
import { UploadService } from './upload.service';

@ApiTags('upload')
@Controller('upload')
export class UploadController {
  constructor(private readonly uploadService: UploadService) {}

  @Post('presign')
  @ApiOperation({ summary: 'Cloudflare R2 업로드용 presigned URL 발급' })
  presign(@Body() dto: PresignDto) {
    return this.uploadService.createPresignedUrl(dto);
  }
}

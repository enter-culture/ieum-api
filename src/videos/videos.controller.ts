import { Body, Controller, Get, Post } from '@nestjs/common';
import { ApiOperation, ApiTags } from '@nestjs/swagger';
import { CreateVideoDto } from './dto/create-video.dto';
import { VideosService } from './videos.service';

@ApiTags('videos')
@Controller('videos')
export class VideosController {
  constructor(private readonly videosService: VideosService) {}

  @Get()
  @ApiOperation({ summary: '비디오 목록 (R2 공개 URL 포함)' })
  list() {
    return this.videosService.list();
  }

  @Post()
  @ApiOperation({ summary: '비디오 등록 (R2 업로드 후 호출)' })
  create(@Body() dto: CreateVideoDto) {
    return this.videosService.create(dto);
  }
}

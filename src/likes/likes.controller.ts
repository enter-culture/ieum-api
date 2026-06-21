import {
  Body,
  Controller,
  Delete,
  Get,
  Param,
  ParseIntPipe,
  Post,
  Req,
  UseGuards,
} from '@nestjs/common';
import { ApiBearerAuth, ApiOperation, ApiTags } from '@nestjs/swagger';
import type { Request } from 'express';
import type { AuthUser } from '../auth/auth.service';
import { JwtAuthGuard } from '../auth/jwt-auth.guard';
import { CreateLikeDto } from './dto/create-like.dto';
import { LikesService } from './likes.service';

@ApiTags('likes')
@ApiBearerAuth()
@UseGuards(JwtAuthGuard)
@Controller('likes')
export class LikesController {
  constructor(private readonly likesService: LikesService) {}

  @Get()
  @ApiOperation({ summary: '내 좋아요 목록' })
  list(@Req() req: Request & { user: AuthUser }) {
    return this.likesService.list(req.user.uid);
  }

  @Post()
  @ApiOperation({ summary: '좋아요 추가 (idempotent)' })
  add(
    @Req() req: Request & { user: AuthUser },
    @Body() dto: CreateLikeDto,
  ) {
    return this.likesService.add(req.user.uid, dto);
  }

  @Delete(':shortsId')
  @ApiOperation({ summary: '좋아요 취소' })
  remove(
    @Req() req: Request & { user: AuthUser },
    @Param('shortsId', ParseIntPipe) shortsId: number,
  ) {
    return this.likesService.remove(req.user.uid, shortsId);
  }
}

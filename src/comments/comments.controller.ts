import {
  Body,
  Controller,
  Get,
  ParseIntPipe,
  Post,
  Query,
  Req,
  UseGuards,
} from '@nestjs/common';
import { ApiBearerAuth, ApiOperation, ApiTags } from '@nestjs/swagger';
import type { Request } from 'express';
import type { AuthUser } from '../auth/auth.service';
import { JwtAuthGuard } from '../auth/jwt-auth.guard';
import { CommentsService } from './comments.service';
import { CreateCommentDto } from './dto/create-comment.dto';

@ApiTags('comments')
@Controller('comments')
export class CommentsController {
  constructor(private readonly commentsService: CommentsService) {}

  @Get()
  @ApiOperation({ summary: '영상 댓글 목록(공개)' })
  list(@Query('shortsId', ParseIntPipe) shortsId: number) {
    return this.commentsService.list(shortsId);
  }

  @Post()
  @ApiBearerAuth()
  @UseGuards(JwtAuthGuard)
  @ApiOperation({ summary: '댓글 작성(로그인 필요)' })
  create(
    @Req() req: Request & { user: AuthUser },
    @Body() dto: CreateCommentDto,
  ) {
    return this.commentsService.create(req.user.uid, dto);
  }
}

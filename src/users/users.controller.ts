import {
  Body,
  Controller,
  Get,
  NotFoundException,
  Patch,
  Req,
  UseGuards,
} from '@nestjs/common';
import { ApiBearerAuth, ApiOperation, ApiTags } from '@nestjs/swagger';
import type { Request } from 'express';
import type { AuthUser } from '../auth/auth.service';
import { JwtAuthGuard } from '../auth/jwt-auth.guard';
import { UpdateUserDto } from './dto/update-user.dto';
import { UsersService } from './users.service';

@ApiTags('users')
@ApiBearerAuth()
@UseGuards(JwtAuthGuard)
@Controller('users')
export class UsersController {
  constructor(private readonly usersService: UsersService) {}

  @Get('me')
  @ApiOperation({ summary: '내 프로필 조회 (DB 기준 최신값)' })
  async me(@Req() req: Request & { user: AuthUser }) {
    const user = await this.usersService.findById(req.user.uid);
    if (!user) throw new NotFoundException('User not found');
    return user;
  }

  @Patch('me')
  @ApiOperation({ summary: '내 프로필 수정 (닉네임/지역/카테고리/사진)' })
  update(
    @Req() req: Request & { user: AuthUser },
    @Body() dto: UpdateUserDto,
  ) {
    return this.usersService.updateProfile(req.user.uid, dto);
  }
}

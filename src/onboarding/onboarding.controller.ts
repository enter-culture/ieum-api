import { Body, Controller, Get, Put, Req, UseGuards } from '@nestjs/common';
import { ApiBearerAuth, ApiOperation, ApiTags } from '@nestjs/swagger';
import type { Request } from 'express';
import type { AuthUser } from '../auth/auth.service';
import { JwtAuthGuard } from '../auth/jwt-auth.guard';
import { SaveOnboardingDto } from './dto/save-onboarding.dto';
import { OnboardingService } from './onboarding.service';

interface OnboardingView {
  vibeList: number[];
  placeCategoryList: number[];
}

@ApiTags('onboarding')
@ApiBearerAuth()
@UseGuards(JwtAuthGuard)
@Controller('onboarding')
export class OnboardingController {
  constructor(private readonly onboardingService: OnboardingService) {}

  @Get('me')
  @ApiOperation({ summary: '내 온보딩 설문 조회 (없으면 null)' })
  async me(
    @Req() req: Request & { user: AuthUser },
  ): Promise<OnboardingView | null> {
    const row = await this.onboardingService.findByUser(req.user.uid);
    if (!row) return null;
    return { vibeList: row.vibeList, placeCategoryList: row.placeCategoryList };
  }

  @Put('me')
  @ApiOperation({ summary: '내 온보딩 설문 저장 (upsert)' })
  async save(
    @Req() req: Request & { user: AuthUser },
    @Body() dto: SaveOnboardingDto,
  ): Promise<OnboardingView> {
    const row = await this.onboardingService.save(req.user.uid, dto);
    return { vibeList: row.vibeList, placeCategoryList: row.placeCategoryList };
  }
}

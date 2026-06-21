import { EntityManager } from '@mikro-orm/core';
import { Injectable } from '@nestjs/common';
import { User } from '../users/user.entity';
import { SaveOnboardingDto } from './dto/save-onboarding.dto';
import { IOnboarding, Onboarding } from './onboarding.entity';

@Injectable()
export class OnboardingService {
  constructor(private readonly em: EntityManager) {}

  /** 내 온보딩 조회. 없으면 null. */
  findByUser(userId: number): Promise<IOnboarding | null> {
    return this.em.findOne(Onboarding, { user: userId });
  }

  /** 온보딩 upsert (없으면 생성, 있으면 갱신). */
  async save(userId: number, dto: SaveOnboardingDto): Promise<IOnboarding> {
    let row = await this.em.findOne(Onboarding, { user: userId });
    if (!row) {
      row = this.em.create(Onboarding, {
        user: this.em.getReference(User, userId),
        vibeList: dto.vibeList,
        placeCategoryList: dto.placeCategoryList,
      });
    } else {
      row.vibeList = dto.vibeList;
      row.placeCategoryList = dto.placeCategoryList;
    }
    await this.em.flush();
    return row;
  }
}

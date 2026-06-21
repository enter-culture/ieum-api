import type { InferEntity } from '@mikro-orm/core';
import { defineEntity, p } from '@mikro-orm/postgresql';
import { User } from '../users/user.entity';

/** 유저당 1개의 온보딩 설문 (vibeList=관심 지역, placeCategoryList=관심 카테고리). */
export const Onboarding = defineEntity({
  name: 'Onboarding',
  tableName: 'onboarding',
  properties: {
    id: p.integer().primary(),
    user: () => p.manyToOne(User),
    vibeList: p.json<number[]>(),
    placeCategoryList: p.json<number[]>(),
    createdAt: p.datetime().onCreate(() => new Date()),
    updatedAt: p
      .datetime()
      .onCreate(() => new Date())
      .onUpdate(() => new Date()),
  },
  uniques: [{ properties: ['user'] }],
});

export type IOnboarding = InferEntity<typeof Onboarding>;

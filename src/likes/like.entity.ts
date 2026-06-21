import type { InferEntity } from '@mikro-orm/core';
import { defineEntity, p } from '@mikro-orm/postgresql';
import { User } from '../users/user.entity';

export const Like = defineEntity({
  name: 'Like',
  tableName: 'likes',
  properties: {
    id: p.integer().primary(),
    user: () => p.manyToOne(User),
    shortsId: p.integer(),
    title: p.string(),
    address: p.string().nullable(),
    categoryHigh: p.string().nullable(),
    videoSrc: p.text().nullable(),
    heritageId: p.string().nullable(),
    createdAt: p.datetime().onCreate(() => new Date()),
  },
  uniques: [{ properties: ['user', 'shortsId'] }],
});

export type ILike = InferEntity<typeof Like>;

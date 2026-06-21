import type { InferEntity } from '@mikro-orm/core';
import { defineEntity, p } from '@mikro-orm/postgresql';

export const User = defineEntity({
  name: 'User',
  tableName: 'users',
  properties: {
    id: p.integer().primary(),
    googleId: p.string().unique(),
    email: p.string(),
    name: p.string(),
    picture: p.text().nullable(),
    nickname: p.text().nullable(),
    region: p.text().nullable(),
    category: p.text().nullable(),
    createdAt: p.datetime().onCreate(() => new Date()),
    updatedAt: p
      .datetime()
      .onCreate(() => new Date())
      .onUpdate(() => new Date()),
  },
});

export type IUser = InferEntity<typeof User>;

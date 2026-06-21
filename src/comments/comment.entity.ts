import type { InferEntity } from '@mikro-orm/core';
import { defineEntity, p } from '@mikro-orm/postgresql';
import { User } from '../users/user.entity';

export const Comment = defineEntity({
  name: 'Comment',
  tableName: 'comments',
  properties: {
    id: p.integer().primary(),
    shortsId: p.integer(),
    user: () => p.manyToOne(User),
    content: p.text(),
    createdAt: p.datetime().onCreate(() => new Date()),
  },
  indexes: [{ properties: ['shortsId', 'createdAt'] }],
});

export type IComment = InferEntity<typeof Comment>;

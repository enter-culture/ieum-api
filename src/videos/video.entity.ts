import type { InferEntity } from '@mikro-orm/core';
import { defineEntity, p } from '@mikro-orm/postgresql';

export const Video = defineEntity({
  name: 'Video',
  tableName: 'videos',
  properties: {
    id: p.integer().primary(),
    title: p.string(),
    description: p.text().nullable(),
    category: p.string().nullable(),
    subCategory: p.string().nullable(),
    region: p.string().nullable(),
    /** R2 객체 key (shorts/...) */
    r2Key: p.string().unique(),
    /** 문화재 slug (예: pansori) */
    heritageId: p.string().nullable(),
    heritageAsno: p.string().nullable(),
    heritageCtcd: p.string().nullable(),
    createdAt: p.datetime().onCreate(() => new Date()),
  },
});

export type IVideo = InferEntity<typeof Video>;

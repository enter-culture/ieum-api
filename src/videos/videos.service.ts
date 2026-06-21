import { EntityManager } from '@mikro-orm/core';
import { Injectable } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { CreateVideoDto } from './dto/create-video.dto';
import { IVideo, Video } from './video.entity';

export interface VideoDto {
  id: number;
  title: string;
  description?: string | null;
  category?: string | null;
  subCategory?: string | null;
  region?: string | null;
  url: string;
  heritageId?: string | null;
  heritageAsno?: string | null;
  heritageCtcd?: string | null;
  createdAt: Date;
}

@Injectable()
export class VideosService {
  constructor(
    private readonly em: EntityManager,
    private readonly config: ConfigService,
  ) {}

  async list(): Promise<VideoDto[]> {
    const videos = await this.em.find(
      Video,
      {},
      { orderBy: { createdAt: 'DESC' } },
    );
    return videos.map((v) => this.toDto(v));
  }

  async create(dto: CreateVideoDto): Promise<VideoDto> {
    let video = await this.em.findOne(Video, { r2Key: dto.r2Key });
    if (!video) {
      video = this.em.create(Video, dto);
    } else {
      Object.assign(video, dto);
    }
    await this.em.flush();
    return this.toDto(video);
  }

  private publicUrl(r2Key: string): string {
    const base = (
      this.config.get<string>('CLOUDFLARE_R2_PUBLIC_URL') ?? ''
    ).replace(/\/$/, '');
    return `${base}/${r2Key}`;
  }

  private toDto(v: IVideo): VideoDto {
    return {
      id: v.id,
      title: v.title,
      description: v.description,
      category: v.category,
      subCategory: v.subCategory,
      region: v.region,
      url: this.publicUrl(v.r2Key),
      heritageId: v.heritageId,
      heritageAsno: v.heritageAsno,
      heritageCtcd: v.heritageCtcd,
      createdAt: v.createdAt,
    };
  }
}

import { GetObjectCommand, S3Client } from '@aws-sdk/client-s3';
import { getSignedUrl } from '@aws-sdk/s3-request-presigner';
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

// presigned GET URL 유효시간 (6시간)
const URL_TTL = 60 * 60 * 6;

@Injectable()
export class VideosService {
  private readonly r2: S3Client;

  constructor(
    private readonly em: EntityManager,
    private readonly config: ConfigService,
  ) {
    this.r2 = new S3Client({
      region: 'auto',
      endpoint: this.config.get<string>('CLOUDFLARE_R2_ENDPOINT'),
      credentials: {
        accessKeyId: this.config.get<string>('CLOUDFLARE_R2_ACCESS_KEY_ID') ?? '',
        secretAccessKey:
          this.config.get<string>('CLOUDFLARE_R2_SECRET_ACCESS_KEY') ?? '',
      },
    });
  }

  async list(): Promise<VideoDto[]> {
    const videos = await this.em.find(
      Video,
      {},
      { orderBy: { createdAt: 'DESC' } },
    );
    return Promise.all(videos.map((v) => this.toDto(v)));
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

  /** R2 객체의 presigned GET URL 발급 (공개 접근 설정 불필요) */
  private signedUrl(r2Key: string): Promise<string> {
    return getSignedUrl(
      this.r2,
      new GetObjectCommand({
        Bucket: this.config.get<string>('CLOUDFLARE_R2_BUCKET_NAME'),
        Key: r2Key,
      }),
      { expiresIn: URL_TTL },
    );
  }

  private async toDto(v: IVideo): Promise<VideoDto> {
    return {
      id: v.id,
      title: v.title,
      description: v.description,
      category: v.category,
      subCategory: v.subCategory,
      region: v.region,
      url: await this.signedUrl(v.r2Key),
      heritageId: v.heritageId,
      heritageAsno: v.heritageAsno,
      heritageCtcd: v.heritageCtcd,
      createdAt: v.createdAt,
    };
  }
}

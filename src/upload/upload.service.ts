import { PutObjectCommand, S3Client } from '@aws-sdk/client-s3';
import { getSignedUrl } from '@aws-sdk/s3-request-presigner';
import { Injectable } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { PresignDto } from './dto/presign.dto';

@Injectable()
export class UploadService {
  private readonly r2: S3Client;

  constructor(private readonly config: ConfigService) {
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

  async createPresignedUrl({ filename, contentType, folder }: PresignDto) {
    const safeName = filename.replace(/[^a-zA-Z0-9._-]/g, '_');
    const key = `${folder ?? 'shorts'}/${Date.now()}-${safeName}`;

    const command = new PutObjectCommand({
      Bucket: this.config.get<string>('CLOUDFLARE_R2_BUCKET_NAME'),
      Key: key,
      ContentType: contentType,
    });

    const presignedUrl = await getSignedUrl(this.r2, command, {
      expiresIn: 3600,
    });

    return { presignedUrl, key };
  }
}

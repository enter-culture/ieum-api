import { EntityManager } from '@mikro-orm/core';
import { Injectable } from '@nestjs/common';
import { User } from '../users/user.entity';
import { CreateLikeDto } from './dto/create-like.dto';
import { ILike, Like } from './like.entity';

export interface LikeDto {
  id: number;
  shortsId: number;
  title: string;
  address?: string | null;
  categoryHigh?: string | null;
  videoSrc?: string | null;
  heritageId?: string | null;
  createdAt: Date;
}

@Injectable()
export class LikesService {
  constructor(private readonly em: EntityManager) {}

  async list(userId: number): Promise<LikeDto[]> {
    const likes = await this.em.find(
      Like,
      { user: userId },
      { orderBy: { createdAt: 'DESC' } },
    );
    return likes.map((l) => this.toDto(l));
  }

  async add(userId: number, dto: CreateLikeDto): Promise<LikeDto> {
    let like = await this.em.findOne(Like, {
      user: userId,
      shortsId: dto.shortsId,
    });
    if (!like) {
      like = this.em.create(Like, {
        user: this.em.getReference(User, userId),
        shortsId: dto.shortsId,
        title: dto.title,
        address: dto.address,
        categoryHigh: dto.categoryHigh,
        videoSrc: dto.videoSrc,
        heritageId: dto.heritageId,
      });
    } else {
      like.title = dto.title;
      like.address = dto.address;
      like.categoryHigh = dto.categoryHigh;
      like.videoSrc = dto.videoSrc;
      like.heritageId = dto.heritageId;
    }
    await this.em.flush();
    return this.toDto(like);
  }

  async remove(userId: number, shortsId: number): Promise<void> {
    const like = await this.em.findOne(Like, { user: userId, shortsId });
    if (like) {
      this.em.remove(like);
      await this.em.flush();
    }
  }

  private toDto(like: ILike): LikeDto {
    return {
      id: like.id,
      shortsId: like.shortsId,
      title: like.title,
      address: like.address,
      categoryHigh: like.categoryHigh,
      videoSrc: like.videoSrc,
      heritageId: like.heritageId,
      createdAt: like.createdAt,
    };
  }
}

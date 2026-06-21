import { EntityManager } from '@mikro-orm/core';
import { Injectable } from '@nestjs/common';
import { User, IUser } from '../users/user.entity';
import { Comment, IComment } from './comment.entity';

export interface CommentDto {
  id: number;
  shortsId: number;
  content: string;
  createdAt: Date;
  author: {
    id: number;
    nickname: string | null;
    name: string;
    picture: string | null;
  };
}

@Injectable()
export class CommentsService {
  constructor(private readonly em: EntityManager) {}

  async list(shortsId: number): Promise<CommentDto[]> {
    const comments = await this.em.find(
      Comment,
      { shortsId },
      { orderBy: { createdAt: 'DESC' }, populate: ['user'] },
    );
    return comments.map((c) => this.toDto(c));
  }

  async create(
    userId: number,
    dto: { shortsId: number; content: string },
  ): Promise<CommentDto> {
    const comment = this.em.create(Comment, {
      shortsId: dto.shortsId,
      content: dto.content,
      user: this.em.getReference(User, userId),
    });
    await this.em.flush();
    return this.toDto(comment as unknown as IComment & { user: IUser });
  }

  private toDto(c: IComment & { user: IUser }): CommentDto {
    return {
      id: c.id,
      shortsId: c.shortsId,
      content: c.content,
      createdAt: c.createdAt,
      author: {
        id: c.user.id,
        nickname: c.user.nickname ?? null,
        name: c.user.name,
        picture: c.user.picture ?? null,
      },
    };
  }
}

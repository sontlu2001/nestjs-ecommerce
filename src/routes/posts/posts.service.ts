import { Injectable } from '@nestjs/common';
import { CreatePostDTO } from './post.dto';
import { PrismaService } from 'src/shared/services/prisma.service';

@Injectable()
export class PostsService {
  constructor(private readonly prismaService: PrismaService) {}
  async create(userId: number, createPostDto: CreatePostDTO) {
    return this.prismaService.post.create({
      data: {
        title: createPostDto.title,
        content: createPostDto.content,
        authorId: userId,
      },
    });
  }
}

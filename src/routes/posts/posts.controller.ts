import { Body, Controller, Post, Req, UseGuards } from '@nestjs/common';
import { PostsService } from './posts.service';
import { CreatePostDTO } from './post.dto';
import type { Request } from 'express';
import { Auth } from 'src/shared/decorators/auth.decorator';
import { AuthType, ConditionGuard, REQUEST_USER_KEY } from 'src/shared/constants/auth.contant';
import { AuthenticationGuard } from 'src/shared/guards/auth.guard';
import { ActiveUser } from 'src/shared/decorators/active-user.decorator';
import { JwtPayload } from 'src/shared/types/jwt.type';

@Controller('posts')
export class PostsController {
  constructor(private readonly postsService: PostsService) {}

  @Auth([AuthType.Bearer], { condition: ConditionGuard.AND })
  @Post('')
  create(@Body() createPostDto: CreatePostDTO, @ActiveUser('userId') userId: number) {
    return this.postsService.create(userId, createPostDto);
  }
}

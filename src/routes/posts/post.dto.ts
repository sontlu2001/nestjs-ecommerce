import { IsString } from 'class-validator';

export class CreatePostDTO {
  @IsString()
  title: string;

  @IsString()
  content: string;

  constructor(partial: Partial<CreatePostDTO>) {
    Object.assign(this, partial);
  }
}

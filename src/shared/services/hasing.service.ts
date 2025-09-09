import { Injectable } from '@nestjs/common';
import { hash } from 'bcrypt';

const saltRounds = 10;

@Injectable()
export class HashingService {
  async hash(value: string): Promise<string> {
    return await hash(value, saltRounds);
  }
}

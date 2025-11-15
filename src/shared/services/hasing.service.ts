import { Injectable } from '@nestjs/common';
import { hash, compare } from 'bcrypt';

const saltRounds = 10;

@Injectable()
export class HashingService {
  async hash(value: string): Promise<string> {
    return await hash(value, saltRounds);
  }

  async compare(value: string, hashedValue: string): Promise<boolean> {
    return await compare(value, hashedValue);
  }
}

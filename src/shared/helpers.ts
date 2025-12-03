import { randomInt } from 'crypto';

export const generateOTP = () => {
  return randomInt(100000, 999999);
};

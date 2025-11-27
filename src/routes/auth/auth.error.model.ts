import { ConflictException, UnprocessableEntityException } from '@nestjs/common';

export const InvalidVerificationCodeError = new UnprocessableEntityException('Error.InvalidVerificationCode');

export const ExpiredVerificationCodeError = new UnprocessableEntityException('Error.ExpiredVerificationCode');

export const EmailAlreadyExistsError = new ConflictException('Error.EmailAlreadyExists');

export const OTPEmailSendError = new UnprocessableEntityException('Error.FailedToSendOTPEmail');

export const InvalidEmailOrPasswordError = new UnprocessableEntityException('Error.InvalidEmailOrPassword');

export const InvalidRefreshTokenError = new UnprocessableEntityException('Error.InvalidRefreshToken');

export const EmailNotFoundError = new UnprocessableEntityException('Error.EmailNotFoundError');

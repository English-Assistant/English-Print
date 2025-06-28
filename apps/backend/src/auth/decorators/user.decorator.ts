import { createParamDecorator, ExecutionContext } from '@nestjs/common';
import { Request } from 'express';

export interface IAuthUser {
  id: number;
  email: string;
}

export const AuthUser = createParamDecorator(
  (data: unknown, ctx: ExecutionContext): IAuthUser => {
    const request = ctx
      .switchToHttp()
      .getRequest<Request & { user: IAuthUser }>();
    return request.user;
  },
);

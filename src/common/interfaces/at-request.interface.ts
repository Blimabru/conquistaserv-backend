import { JwtPayload } from 'src/common/types';

export interface AccessTokenRequest extends Express.Request {
  user: JwtPayload;
}

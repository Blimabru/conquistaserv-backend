import { JwtRefreshPayload } from '../types';

export interface RefreshTokenRequest extends Express.Request {
  user: JwtRefreshPayload;
}

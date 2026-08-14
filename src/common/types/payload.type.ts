export type JwtRefreshPayload = JwtPayload & {
  login: string;
  refreshToken?: string;
};

export type JwtPayload = {
  sub: string;
  role: string;
};

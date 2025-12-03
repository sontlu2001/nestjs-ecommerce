export interface AccessTokenPayload {
  userId: number;
  deviceId: number;
  roleId: number;
  roleName: string;
}

export interface RefreshTokenPayload {
  userId: number;
}

export interface AccessTokenDecoded extends AccessTokenPayload {
  iat: number;
  exp: number;
}

export interface RefreshTokenDecoded extends RefreshTokenPayload {
  iat: number;
  exp: number;
}

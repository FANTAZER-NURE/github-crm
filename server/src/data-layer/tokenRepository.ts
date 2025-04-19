import { RevokedToken } from '../generated/prisma';

import { PrismaClient } from '../generated/prisma';

export class TokenRepository {
  private prisma: PrismaClient;

  constructor(prisma?: PrismaClient) {
    this.prisma = prisma || new PrismaClient();
  }

  async createRevokedToken(token: string): Promise<RevokedToken> {
    return this.prisma.revokedToken.create({
      data: { token },
    });
  }

  async findRevokedToken(token: string): Promise<RevokedToken | null> {
    return this.prisma.revokedToken.findFirst({
      where: { token },
    });
  }
}
